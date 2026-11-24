<template>
  <div class="glass-panel quiz-panel" :aria-busy="grading">
    <div class="question-heading">
      <div class="question-meta">
        <span class="topic-badge">{{ question.topic }}</span>
        <span v-if="question.code" class="question-code">{{ question.code }}</span>
        <span v-if="question.level" class="level-badge">{{ levelLabels[question.level] }}</span>
      </div>
      <button @click="toggleTTS" class="btn speech-button" :title="isPlayingTTS ? 'Pausar lectura' : 'Escuchar pregunta'">{{ isPlayingTTS ? '‖ Pausar' : '▶ Dictar' }}</button>
    </div>
    <p v-if="question.theme || question.skill" class="skill-line">{{ question.theme }}<span v-if="question.skill"> · {{ question.skill }}</span></p>
    <div v-if="question.stimulus" v-latex="question.stimulus" class="question-stimulus"></div>
    <h2 v-latex="question.question" class="question-title"></h2>
    <figure v-if="question.figure" class="question-figure"><img :src="question.figure" :alt="question.figureAlt || 'Figura de apoyo para el ejercicio'" loading="lazy"><figcaption v-if="question.figureCaption">{{ question.figureCaption }}</figcaption></figure>

    <div v-if="!question.type || question.type === 'multiple'" class="option-list">
      <button v-for="(option,index) in shuffledOptions" :key="option.id" type="button" class="option-card"
        :disabled="showResult || grading" :class="{ selected:selectedOption===option.id, correct:showResult&&option.isCorrect, wrong:showResult&&selectedOption===option.id&&!option.isCorrect }"
        @click="selectedOption=option.id">
        <span class="option-letter">{{ String.fromCharCode(65+index) }}</span><span v-latex="option.text" class="option-text"></span>
        <span v-if="showResult&&option.isCorrect">✓</span><span v-if="showResult&&selectedOption===option.id&&!option.isCorrect">✗</span>
      </button>
    </div>
    <div v-else-if="question.type==='open'" class="open-response">
      <label :for="'answer-'+question.id">{{ isReviewQuestion ? 'Tu resultado o razonamiento' : 'Escribe tu respuesta' }}</label>
      <textarea v-if="isReviewQuestion" :id="'answer-'+question.id" v-model="openAnswer" :disabled="showResult||grading" rows="3" maxlength="8000" placeholder="Escribe tu respuesta. Si dibujaste en papel, describe sus puntos o características principales."></textarea>
      <input v-else :id="'answer-'+question.id" v-model="openAnswer" type="text" :disabled="showResult||grading" maxlength="1000" placeholder="Número, fracción o respuesta" @keyup.enter="isAnswerFilled&&!showResult&&!grading&&submitAnswer()" :class="{ 'correct-border':showResult&&answerCorrect, 'wrong-border':showResult&&!answerCorrect }">
      <div v-if="isReviewQuestion&&!showResult" class="review-mode"><span>{{ geminiReady ? 'Revisión asistida con Gemini' : 'Comparación con respuesta modelo' }}</span><button type="button" @click="$emit('settings-requested')">Configurar</button></div>
      <p v-if="showResult" class="result-text" :class="answerCorrect?'text-success':'text-review'">{{ resultMethod==='self' ? 'Autorrevisión registrada' : resultMethod==='gemini' ? 'Revisión de Gemini' : 'Comprobación automática' }}: {{ answerCorrect ? 'respuesta correcta' : 'requiere corrección' }}.</p>
    </div>
    <div v-else-if="question.type==='table'" class="table-response">
      <table class="custom-matching-table"><thead><tr><th>{{ question.headers?.[0] }}</th><th v-for="h in (question.headers||[]).slice(1)" :key="h">{{ h }}</th></tr></thead>
        <tbody><tr v-for="row in question.rows" :key="row.id"><td v-latex="row.text"></td><td v-for="h in (question.headers||[]).slice(1)" :key="h"><button class="table-choice-btn" :disabled="showResult||grading" @click="tableAnswers[row.id]=h" :aria-label="row.text+': '+h" :class="{selected:tableAnswers[row.id]===h,correct:showResult&&row.correct===h,wrong:showResult&&tableAnswers[row.id]===h&&row.correct!==h}">{{ h[0] }}</button></td></tr></tbody>
      </table>
    </div>

    <div v-if="grading||reviewError||reviewFeedback" class="review-status" role="status" aria-live="polite">
      <p v-if="grading">Gemini está revisando tu respuesta…</p>
      <p v-if="reviewError">{{ reviewError }}</p>
      <p v-if="reviewFeedback">{{ reviewFeedback }}</p>
      <div v-if="!grading&&!showResult&&(reviewError||reviewFeedback)" class="review-options">
        <button v-if="geminiReady" class="btn btn-secondary" @click="reviewWithGemini">Reintentar con Gemini</button>
        <button v-if="!reviewOpen" class="btn btn-secondary" @click="reviewOpen=true">Comparar por mi cuenta</button>
      </div>
    </div>
    <section v-if="reviewOpen&&!showResult" class="manual-review" aria-label="Comparación con solución">
      <h3>Compara con la solución</h3>
      <div v-latex="question.correctAnswer" class="model-answer"></div>
      <div v-latex="question.explanation" class="model-rubric"></div>
      <p>Revisa el resultado, las condiciones y los pasos necesarios. Las expresiones equivalentes también son válidas.</p>
      <div class="review-options"><button class="btn btn-primary" @click="finishSelfReview(true)">Sí, mi respuesta cumple</button><button class="btn btn-secondary" @click="finishSelfReview(false)">Necesito corregirla</button><button class="btn text-button" @click="reviewOpen=false;reviewFeedback='';reviewError=''">Editar respuesta</button></div>
      <small>Se registra como autorrevisión, separada de la comprobación automática.</small>
    </section>

    <div class="quiz-actions">
      <div class="navigation"><button class="btn btn-secondary" :disabled="!hasPrev||grading" @click="$emit('prev')">← Anterior</button><button class="btn btn-secondary" :disabled="!hasNext||grading" @click="$emit('next-nav')">Siguiente →</button></div>
      <div class="action-panel">
        <button v-if="question.hint&&!showHint&&!showResult&&!hintAlreadyUsed&&!grading" @click="useHint" class="btn hint-button">? Pista (-3 pts)</button>
        <div v-if="question.hint&&(showHint||hintAlreadyUsed)" class="hint-copy"><strong>Pista:</strong> <span v-latex="question.hint"></span></div>
        <button v-if="showResult" @click="$emit('show-feedback')" class="btn btn-secondary">Ver explicación</button>
        <button v-else-if="!reviewOpen" class="btn btn-primary" :disabled="!isAnswerFilled||grading" @click="submitAnswer">{{ grading ? 'Revisando…' : isReviewQuestion ? (geminiReady?'Revisar con Gemini':'Comparar solución') : 'Comprobar' }}</button>
      </div>
    </div>
  </div>
</template>
<script>
const { ref,watch,computed,onUnmounted }=Vue;
export default {
  props:{question:Object,pastAnswer:{type:Object,default:null},hintAlreadyUsed:{type:Boolean,default:false},hasPrev:{type:Boolean,default:false},hasNext:{type:Boolean,default:false}},
  emits:['answer-selected','hint-used','prev','next-nav','show-feedback','settings-requested'],
  setup(props,{emit}){
    const selectedOption=ref(null),openAnswer=ref(''),tableAnswers=ref({}),showResult=ref(false),showHint=ref(false),hintUsed=ref(false),shuffledOptions=ref([]);
    const grading=ref(false),reviewOpen=ref(false),reviewError=ref(''),reviewFeedback=ref(''),answerCorrect=ref(false),resultMethod=ref('exact');
    const gemini=window.useGemini(); const geminiReady=gemini.ready;
    const levelLabels={1:'Fácil',2:'Medio',3:'Semidifícil',4:'Difícil'};
    const isReviewQuestion=computed(()=>props.question.type==='open'&&props.question.answerMode==='self');
    let controller=null,attempt=0,active=true;
    const shuffle=arr=>{const copy=[...(arr||[])];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
    function init(){
      attempt++;controller?.abort();controller=null;grading.value=false;reviewOpen.value=false;reviewError.value='';reviewFeedback.value='';showHint.value=false;hintUsed.value=false;
      const past=props.pastAnswer;selectedOption.value=past?.selectedOptionId??null;openAnswer.value=past?.openAnswer||'';tableAnswers.value={...(past?.tableAnswers||{})};showResult.value=Boolean(past);answerCorrect.value=past?.isCorrect===true;resultMethod.value=past?.gradingMethod||'exact';
      if(past?.modelFeedback)reviewFeedback.value=past.modelFeedback;
      const options=props.question.options||[];
      const order=past?.optionOrder||past?.shuffledOptions?.map(o=>o.id);
      shuffledOptions.value=order?order.map(id=>options.find(o=>o.id===id)).filter(Boolean):shuffle(options);
    }
    watch(()=>props.question,()=>{window.speechSynthesis?.cancel();isPlayingTTS.value=false;init();});
    const isAnswerFilled=computed(()=>props.question.type==='open'?openAnswer.value.trim().length>0:props.question.type==='table'?(props.question.rows||[]).length>0&&props.question.rows.every(r=>tableAnswers.value[r.id]!==undefined):selectedOption.value!==null);
    function commit(isCorrect,method,extra={}){
      if(showResult.value)return;
      showResult.value=true;answerCorrect.value=isCorrect;resultMethod.value=method;reviewOpen.value=false;
      emit('answer-selected',{questionId:props.question.id,isCorrect,gradingMethod:method,usedHint:hintUsed.value,selectedOptionId:selectedOption.value,openAnswer:openAnswer.value,tableAnswers:{...tableAnswers.value},shuffledOptions:[...shuffledOptions.value],...extra});
    }
    async function reviewWithGemini(){
      if(grading.value||showResult.value||!isAnswerFilled.value)return;
      const seq=++attempt,id=props.question.id;controller?.abort();controller=new AbortController();grading.value=true;reviewError.value='';reviewFeedback.value='';
      try{
        const result=await gemini.grade(props.question,openAnswer.value,{signal:controller.signal});
        if(!active||seq!==attempt||props.question.id!==id)return;
        reviewFeedback.value=result.feedback;
        if(result.verdict==='needs_review'){reviewOpen.value=true;return;}
        commit(result.verdict==='correct','gemini',{confidence:result.confidence,modelFeedback:result.feedback});
      }catch(error){if(active&&seq===attempt&&props.question.id===id)reviewError.value=error.message||'No se pudo completar la revisión. Puedes comparar por tu cuenta.';}
      finally{if(active&&seq===attempt)grading.value=false;}
    }
    function submitAnswer(){
      if(grading.value||showResult.value||!isAnswerFilled.value)return;
      if(isReviewQuestion.value){if(geminiReady.value)reviewWithGemini();else reviewOpen.value=true;return;}
      if(props.question.type==='open'){
        const result=window.EXCOBA_ANSWER_VALIDATION.gradeExact(props.question,openAnswer.value);
        if(result.verdict==='needs_review'){reviewOpen.value=true;reviewFeedback.value=result.feedback||'Compara este resultado con la solución.';return;}
        commit(result.verdict==='correct','exact');
      }else if(props.question.type==='table')commit(props.question.rows.every(r=>tableAnswers.value[r.id]===r.correct),'exact');
      else commit(shuffledOptions.value.find(o=>o.id===selectedOption.value)?.isCorrect===true,'exact');
    }
    function finishSelfReview(correct){if(reviewOpen.value&&!grading.value&&isAnswerFilled.value)commit(correct,'self');}
    function useHint(){if(showHint.value||props.hintAlreadyUsed)return;showHint.value=true;hintUsed.value=true;emit('hint-used');}
    const isPlayingTTS=ref(false);
    function toggleTTS(){
      const synth=window.speechSynthesis;if(!synth)return;if(isPlayingTTS.value){synth.cancel();isPlayingTTS.value=false;return;}synth.cancel();
      // Bounded replacements also handle unbraced roots without a retry loop.
      let text=String(props.question.question||'').replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g,'$1 entre $2').replace(/\\sqrt\{([^{}]*)\}/g,'raíz cuadrada de $1').replace(/\\sqrt\s*([a-zA-Z0-9])/g,'raíz cuadrada de $1').replace(/\\(?:cdot|times)/g,' por ').replace(/\\pi/g,' pi ').replace(/\\circ/g,' grados ').replace(/\\[a-zA-Z]+/g,' ').replace(/<[^>]*>/g,' ').replace(/[$^{}_]/g,' ').replace(/\s+/g,' ').trim();
      const speech=new SpeechSynthesisUtterance(text);speech.lang='es-MX';const voices=synth.getVoices();const voice=voices.find(v=>v.lang?.toLowerCase()==='es-mx')||voices.find(v=>v.lang?.toLowerCase().startsWith('es'));if(voice)speech.voice=voice;
      speech.onend=speech.onerror=()=>{isPlayingTTS.value=false;};isPlayingTTS.value=true;synth.speak(speech);
    }
    onUnmounted(()=>{active=false;attempt++;controller?.abort();window.speechSynthesis?.cancel();});
    init();
    return{selectedOption,openAnswer,tableAnswers,showResult,showHint,shuffledOptions,grading,reviewOpen,reviewError,reviewFeedback,answerCorrect,resultMethod,geminiReady,isReviewQuestion,isAnswerFilled,levelLabels,submitAnswer,reviewWithGemini,finishSelfReview,useHint,toggleTTS,isPlayingTTS};
  }
};
</script>
<style scoped>
.quiz-panel{padding:2rem}.question-heading,.question-meta,.review-mode,.quiz-actions,.action-panel,.navigation,.review-options{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap}.question-heading,.quiz-actions{justify-content:space-between}.topic-badge,.level-badge{padding:4px 12px;border-radius:20px;font-weight:700;font-size:.8rem;background:rgba(79,70,229,.1);color:var(--primary)}.level-badge{background:rgba(16,185,129,.1);color:var(--secondary)}.question-code,.skill-line{color:var(--text-muted);font-size:.85rem}.skill-line{margin:.7rem 0 1rem}.speech-button{background:transparent;border:1px solid var(--glass-border);color:var(--primary);padding:6px 12px;font-size:.85rem}.question-title{font-size:1.6rem;line-height:1.4;margin:1rem 0 1.5rem}.question-stimulus{padding:1rem;border:1px solid var(--glass-border);border-radius:12px;line-height:1.55}.question-figure{margin:1rem 0;text-align:center}.question-figure img{max-width:100%;height:auto;background:#fff;border-radius:10px}.question-figure figcaption{font-size:.82rem;color:var(--text-muted);margin-top:.5rem}.option-list{display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem}.option-card{display:flex;text-align:left;font:inherit;align-items:center;color:var(--text-main)}.option-letter{margin-right:15px;font-weight:700;color:var(--text-muted)}.option-text{flex:1}.open-response{margin-bottom:1.5rem}.open-response label{display:block;font-size:.85rem;font-weight:800;color:var(--text-muted);margin-bottom:.5rem}.open-response input,.open-response textarea{width:100%;padding:12px 16px;border-radius:12px;border:2px solid var(--glass-border);font:inherit;font-size:1.05rem;color:var(--text-main);background:var(--calc-tab-bg-active);resize:vertical;box-sizing:border-box}.open-response input{max-width:440px}.open-response input:focus,.open-response textarea:focus{outline:2px solid var(--primary);outline-offset:2px}.review-mode{font-size:.8rem;color:var(--text-muted);margin-top:.6rem}.review-mode button,.text-button{background:none;border:0;color:var(--primary);cursor:pointer;font:inherit;text-decoration:underline}.review-status{padding:.9rem 1rem;background:rgba(79,70,229,.07);border-radius:12px;line-height:1.5;margin:1rem 0}.review-status p{margin:.2rem 0}.manual-review{padding:1.2rem;border:1px solid var(--glass-border);border-radius:16px;margin:1rem 0;background:rgba(16,185,129,.06)}.manual-review h3{margin:0 0 .8rem}.model-answer{font-weight:700;font-size:1.1rem}.model-rubric{margin:.8rem 0;line-height:1.6}.manual-review p,.manual-review small{color:var(--text-muted);line-height:1.5}.manual-review small{display:block;margin-top:.8rem}.review-options{margin-top:.8rem}.quiz-actions{border-top:1px solid var(--glass-border);padding-top:1.5rem}.hint-button{background:transparent;color:var(--warning);border:2px solid var(--warning)}.hint-copy{font-size:.88rem;max-width:300px}.table-response{overflow:auto;margin-bottom:1.5rem}.table-response table{width:100%;border-collapse:collapse}.table-response th,.table-response td{padding:.8rem;border-bottom:1px solid var(--glass-border)}.table-response th:first-child,.table-response td:first-child{text-align:left}.table-response td{text-align:center}.table-choice-btn{width:36px;height:36px;border-radius:50%;border:2px solid var(--glass-border);cursor:pointer;background:transparent;color:var(--text-main)}.text-success{color:var(--secondary)}.text-review{color:var(--warning)}.result-text{font-weight:700}.correct-border{border-color:var(--secondary)!important}.wrong-border{border-color:var(--warning)!important}button:disabled{cursor:default;opacity:.65}@media(max-width:600px){.quiz-panel{padding:1.1rem}.question-title{font-size:1.2rem}.quiz-actions{gap:1rem}.review-options>.btn{width:100%}.navigation{width:100%;justify-content:space-between}}
</style>

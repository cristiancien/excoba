<template>
  <div class="app-layout" style="max-width: 1300px; margin: 0 auto; padding: 1.5rem; position: relative; z-index: 1;">
    
    <!-- 1. PANTALLA: MENÚ PRINCIPAL -->
    <transition name="fade" mode="out-in">
      <div v-if="currentScreen === 'menu'" class="main-menu-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 1rem;">
        
        <!-- Theme Switcher (Claro/Oscuro) -->
        <div style="position: absolute; top: 25px; right: 25px; z-index: 10;">
          <button @click="toggleTheme" class="btn glass-panel theme-toggle-btn" style="padding: 10px 16px; border-radius: 14px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s ease; border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); font-weight: 700;">
            <span v-if="isDarkMode">☀️ Modo Claro</span>
            <span v-else>🌙 Modo Oscuro</span>
          </button>
        </div>

        <!-- Tarjeta Central Premium -->
        <div class="glass-panel menu-hero-card" style="max-width: 650px; width: 100%; padding: 3.5rem 2.5rem; text-align: center; display: flex; flex-direction: column; gap: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.15); border-radius: 24px;">
          
          <!-- Logo / Icono Lúdico Académico con Favicon -->
          <div style="display: flex; justify-content: center; align-items: center;">
            <div class="pulse-icon" style="background: linear-gradient(135deg, var(--primary), #818cf8); width: 90px; height: 90px; border-radius: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4); animation: float 3s ease-in-out infinite; padding: 4px;">
              <img src="favicon.png" alt="EXCOBA Prep Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 22px;" />
            </div>
          </div>

          <!-- Título y Descripción -->
          <div>
            <h1 style="font-size: 2.3rem; color: var(--text-main); margin-bottom: 0.4rem; font-weight: 800; background: linear-gradient(90deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.2;">
              EXCOBA Prep
            </h1>
            <h2 style="font-size: 1.2rem; color: var(--text-muted); font-weight: 700; margin-bottom: 1.2rem;">
              Simulador Especialidad: Arquitectura & Diseño
            </h2>
            <p style="font-size: 1.05rem; color: var(--text-muted); line-height: 1.6; margin: 0 auto; max-width: 480px;">
              Prepárate al nivel de los mejores. Pon a prueba tus conocimientos con nuestro simulador interactivo premium estilo Brilliant.org.
            </p>
          </div>

          <!-- Resumen del Temario -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 0.5rem 0;" class="menu-stats-grid">
            <div class="glass-panel" style="padding: 14px; border-radius: 18px; background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.5);">
              <span style="font-size: 1.6rem; font-weight: 800; color: var(--primary); display: block;">180</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Reactivos</span>
            </div>
            <div class="glass-panel" style="padding: 14px; border-radius: 18px; background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.5);">
              <span style="font-size: 1.6rem; font-weight: 800; color: var(--secondary); display: block;">3</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Secciones</span>
            </div>
            <div class="glass-panel" style="padding: 14px; border-radius: 18px; background: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.5);">
              <span style="font-size: 1.6rem; font-weight: 800; color: var(--warning); display: block;">9</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Subtemas</span>
            </div>
          </div>

          <!-- Secciones de Estudio y Pruebas Disponibles -->
          <div style="text-align: left; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <h3 style="font-size: 1.1rem; color: var(--text-main); font-weight: 800; display: flex; align-items: center; gap: 6px; border-bottom: 2px solid var(--glass-border); padding-bottom: 0.5rem; margin: 0;">
              📚 Secciones y Pruebas de Estudio
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Tarjeta 1: Especialidad de Arquitectura & Diseño (Activa) -->
              <div class="glass-panel" style="padding: 1.2rem; border-radius: 16px; border: 2px solid var(--primary); background: rgba(79, 70, 229, 0.04); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 250px;">
                  <span style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">Prueba de Arquitectura & Diseño</span>
                  <div style="display: flex; gap: 8px; font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
                    <span>📋 180 Preguntas</span>
                    <span>•</span>
                    <span>⚡ Simulación EXCOBA Completa</span>
                  </div>
                  <!-- Progreso Badge -->
                  <div v-if="questions.length > 0 && overallSolvedCount > 0" style="margin-top: 6px; display: inline-flex;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--secondary); background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 8px;">
                      Progreso: Resueltas {{ overallSolvedCount }} de 180 ({{ progressPercentage }}%)
                    </span>
                  </div>
                </div>
                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                  <button v-if="questions.length > 0" @click="resumeExamFromMenu" class="btn btn-secondary" style="padding: 10px 18px; font-size: 0.9rem; border-radius: 12px; font-weight: 800;">
                    Continuar
                  </button>
                  <button @click="startExam" class="btn btn-primary" style="padding: 10px 18px; font-size: 0.9rem; border-radius: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
                    {{ questions.length > 0 ? 'Reiniciar' : 'Comenzar' }}
                  </button>
                </div>
              </div>

              <!-- Tarjeta Genérica Próximamente -->
              <div class="glass-panel" style="padding: 1.2rem; border-radius: 16px; border: 1px solid var(--glass-border); opacity: 0.6; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">Prueba</span>
                  <div style="display: flex; gap: 8px; font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
                    <span>📋 - Preguntas</span>
                    <span>•</span>
                    <span>Tema</span>
                  </div>
                </div>
                <div>
                  <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted); background: rgba(0,0,0,0.06); padding: 6px 12px; border-radius: 10px;">Próximamente 🔒</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. PANTALLA: EXAMEN ACTIVO -->
      <div v-else-if="currentScreen === 'exam'" style="display: flex; flex-direction: column; gap: 0;">
        
        <!-- Header: Barra de Controles Única con Logo y Utilidades -->
        <header class="glass-panel" style="padding: 1rem 2rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          
          <!-- Logo de EXCOBA Prep (Favicon) -->
          <div style="display: flex; align-items: center; gap: 10px;" class="header-logo-group">
            <img src="favicon.png" alt="EXCOBA Prep Logo" style="width: 32px; height: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.12);" />
            <span style="font-weight: 800; font-size: 1.15rem; background: linear-gradient(90deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">EXCOBA Prep</span>
          </div>

          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 12px;" class="header-controls-group">
            <!-- Botón para ver el Banco si está colapsado -->
            <button 
              v-if="sidebarCollapsed" 
              @click="sidebarCollapsed = false" 
              class="btn" 
              title="Mostrar menú"
              style="padding: 8px 12px; font-size: 0.9rem; border-radius: 12px; display: flex; align-items: center; gap: 6px; border: 1px solid var(--glass-border); background: var(--glass-bg); color: var(--text-main); cursor: pointer; transition: all 0.2s; font-weight: 700;"
            >
              📂 Ver Temas
            </button>

            <!-- Cronómetro Monospace -->
            <div class="glass-panel timer-badge" style="display: flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 14px; background: rgba(79, 70, 229, 0.05); border-color: rgba(79, 70, 229, 0.2); border-style: solid; border-width: 1px;">
              <svg class="timer-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span style="font-family: monospace; font-size: 1.15rem; font-weight: 800; color: var(--primary); letter-spacing: 0.5px;">
                {{ formattedTime }}
              </span>
            </div>

            <!-- Botón Pausa -->
            <button @click="pauseExam" class="btn btn-pause" style="padding: 8px 16px; font-size: 0.9rem; border-radius: 12px; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(0,0,0,0.15); background: white; color: var(--text-main); cursor: pointer; transition: all 0.2s; font-weight: 700;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              Pausar ⏸️
            </button>

            <!-- Botón del Formulario Científico -->
            <button @click="toggleFormulario" class="btn btn-secondary-outline" style="padding: 8px 16px; font-size: 0.9rem; border-radius: 12px; display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #065f46; cursor: pointer; transition: all 0.2s; font-weight: 700;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              {{ showFormulario ? 'Ocultar Formulario' : 'Ver Formulario' }}
            </button>

            <!-- Botón de la Calculadora -->
            <button @click="toggleCalculator" class="btn btn-primary-outline" style="padding: 8px 16px; font-size: 0.9rem; border-radius: 12px; display: flex; align-items: center; gap: 6px; background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3); color: var(--primary); cursor: pointer; transition: all 0.2s; font-weight: 700;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line><line x1="9" y1="15" x2="9.01" y2="15"></line><line x1="15" y1="15" x2="15.01" y2="15"></line></svg>
              {{ showCalculator ? 'Ocultar Herramientas' : 'Calculadora & Conversor 🧮' }}
            </button>

            <!-- Marcador de Puntos -->
            <div class="glass-panel" style="display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 14px;">
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">Puntos:</span>
              <div style="display: flex; align-items: center; gap: 4px; color: var(--warning); font-weight: 800; font-size: 1.25rem;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                {{ score }}
              </div>
            </div>
          </div>

        </header>

        <!-- Main Dynamic Layout: Sidebar + Main Workspace -->
        <div style="display: flex; gap: 1.5rem; align-items: flex-start; position: relative;" class="responsive-container">
          
          <!-- Menú de la Izquierda Colapsable -->
          <aside 
            class="glass-panel sidebar" 
            :class="{ 'collapsed': sidebarCollapsed }"
            style="width: 320px; padding: 1.5rem; flex-shrink: 0; display: flex; flex-direction: column; gap: 1.2rem; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--glass-border); padding-bottom: 0.8rem;">
              <h2 style="font-size: 1.15rem; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px; font-weight: 800;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Banco de Preguntas
              </h2>
              <!-- Botón interno para colapsar -->
              <button @click="sidebarCollapsed = true" class="collapse-btn" title="Ocultar menú" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: background 0.2s;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
              </button>
            </div>
            
            <div class="sidebar-scroll" style="overflow-y: auto; max-height: 65vh; display: flex; flex-direction: column; gap: 1rem; padding-right: 5px;">
              
              <div v-for="section in sectionsData" :key="section.name" class="section-group" style="margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 6px;">
                <!-- Encabezado de Sección Colapsable (Acordeón) -->
                <div 
                  @click="toggleSection(section.name)" 
                  class="section-accordion-header"
                  style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(79, 70, 229, 0.06); border: 1px solid rgba(79, 70, 229, 0.12); border-radius: 12px; cursor: pointer; transition: all 0.2s; user-select: none;"
                >
                  <span style="font-weight: 800; font-size: 0.85rem; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ section.name }}
                  </span>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); background: rgba(255,255,255,0.7); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.05);">
                      {{ getSectionProgressText(section.name) }}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--primary); font-weight: 800;">
                      {{ expandedSections[section.name] ? '▼' : '▶' }}
                    </span>
                  </div>
                </div>

                <!-- Contenido de la Sección (Subtemas y Preguntas) -->
                <div v-show="expandedSections[section.name]" class="section-content" style="padding: 4px 2px 8px 6px; display: flex; flex-direction: column; gap: 10px;">
                  <div v-for="topic in section.topics" :key="topic.name" class="topic-group" style="display: flex; flex-direction: column; gap: 6px;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; padding: 0 4px;">
                      <h4 style="font-size: 0.8rem; color: var(--text-main); font-weight: 800; margin: 0; display: flex; align-items: center; gap: 4px; text-transform: capitalize;">
                        <span style="display: inline-block; width: 6px; height: 6px; background-color: var(--secondary); border-radius: 50%;"></span>
                        {{ topic.name }}
                      </h4>
                      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 800;">
                        {{ getTopicProgressText(section.name, topic.name) }}
                      </span>
                    </div>

                    <!-- Cuadrícula compacta de 5 columnas para las 20 preguntas del subtema -->
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px;">
                      <button 
                        v-for="q in topic.questions" 
                        :key="q.id"
                        @click="jumpToQuestion(q.originalIndex)"
                        class="sidebar-q-dot"
                        :class="{ 
                          'active': currentQuestionIndex === q.originalIndex,
                          'solved-correct': answeredStatus[q.id]?.isCorrect === true,
                          'solved-wrong': answeredStatus[q.id]?.isCorrect === false,
                          'hint-used': hintsUsedStatus[q.id]
                        }"
                        :title="`Pregunta ${q.displayId}: ${cleanQuestionTextFull(q.question)}`"
                      >
                        {{ q.displayId }}
                        <span v-if="hintsUsedStatus[q.id]" class="hint-pin">💡</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          <!-- Botón flotante para restaurar menú cuando está colapsado -->
          <button 
            v-if="sidebarCollapsed" 
            @click="sidebarCollapsed = false" 
            class="floating-expand-btn glass-panel"
            title="Mostrar menú de preguntas"
            style="position: absolute; left: -10px; top: 15px; z-index: 10; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; border: 1px solid var(--primary); background: white; color: var(--primary); box-shadow: 0 4px 12px rgba(79,70,229,0.2); transition: all 0.2s;"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
          </button>

          <!-- Contenido Principal: Breadcrumb, Progreso y Pregunta -->
          <main style="flex: 1; display: flex; flex-direction: column; gap: 1.5rem; min-width: 0;">
            
            <!-- Breadcrumb & Doble Progreso Segmentado -->
            <div class="glass-panel" style="padding: 1.2rem 1.8rem; display: flex; flex-direction: column; gap: 1rem; position: relative;">
              
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <nav class="breadcrumb" style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 600; color: var(--text-muted); flex-wrap: wrap;">
                  <!-- Toggle de Sidebar interno en el breadcrumb si no está expandido -->
                  <button 
                    v-if="sidebarCollapsed" 
                    @click="sidebarCollapsed = false" 
                    style="background: none; border: none; cursor: pointer; color: var(--primary); font-weight: 800; padding: 2px 6px; font-size: 1rem;"
                    title="Mostrar menú de temas"
                  >
                    ☰
                  </button>
                  <span style="cursor: pointer; transition: color 0.2s;" @click="pauseExam">EXCOBA</span>
                  <span style="opacity: 0.5;">/</span>
                  <span style="text-transform: uppercase; font-size: 0.85rem; font-weight: 700; color: var(--secondary);">{{ currentQuestion?.section }}</span>
                  <span style="opacity: 0.5;">/</span>
                  <span style="color: var(--primary); font-weight: 800;">{{ currentQuestion?.topic }}</span>
                  <span style="opacity: 0.5;">/</span>
                  <span style="color: var(--text-main); font-weight: 800;">Pregunta {{ currentQuestionIndex + 1 }}</span>
                </nav>
                
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">
                  Progreso General: {{ overallSolvedCount }} / 180 resueltas
                </div>
              </div>
              
              <!-- Doble Barra de Progreso Lúdica por Sección y Subtema -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;" class="progress-grid-split">
                
                <!-- Progreso Sección -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
                    <span>Progreso Sección: {{ currentQuestion?.section }}</span>
                    <span style="color: var(--secondary);">{{ activeSectionProgress }}% ({{ activeSectionSolved }}/{{ activeSectionTotal }})</span>
                  </div>
                  <div class="progress-container" style="height: 8px; background: rgba(0, 0, 0, 0.08); border-radius: 4px; overflow: hidden;">
                    <div class="progress-bar-section" :style="{ width: activeSectionProgress + '%' }"></div>
                  </div>
                </div>

                <!-- Progreso Subtema -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
                    <span>Progreso Subtema: {{ currentQuestion?.topic }}</span>
                    <span style="color: var(--primary);">{{ activeTopicProgress }}% ({{ activeTopicSolved }}/{{ activeTopicTotal }})</span>
                  </div>
                  <div class="progress-container" style="height: 8px; background: rgba(0, 0, 0, 0.08); border-radius: 4px; overflow: hidden;">
                    <div class="progress-bar-topic" :style="{ width: activeTopicProgress + '%' }"></div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Quiz View Area o Summary View -->
            <transition name="fade" mode="out-in">
              <QuizView 
                v-if="!showFeedback && currentQuestion"
                :question="currentQuestion"
                :past-answer="answeredStatus[currentQuestion.id]"
                :hint-already-used="!!hintsUsedStatus[currentQuestion.id]"
                :has-prev="currentQuestionIndex > 0"
                :has-next="currentQuestionIndex < totalQuestions - 1"
                @answer-selected="handleAnswer"
                @hint-used="handleHint"
                @prev="prevQuestion"
                @next-nav="nextQuestionNav"
              />
              
              <div v-else-if="!currentQuestion" class="glass-panel" style="padding: 4rem 2rem; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
                <h2 style="color: var(--secondary); font-size: 2rem; margin-bottom: 1rem; font-weight: 800;">¡Felicidades, Futuro Universitario!</h2>
                <p style="font-size: 1.15rem; max-width: 500px; margin: 0 auto 2rem; color: var(--text-muted);">
                  Has recorrido con éxito todo el banco de preguntas oficial del temario EXCOBA. ¡Tu dedicación dará grandes frutos!
                </p>
                <div class="glass-panel" style="display: inline-block; padding: 1rem 2rem; margin-bottom: 2rem; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.2);">
                  <span style="font-size: 1.1rem; color: var(--text-muted);">Puntuación Final:</span>
                  <h3 style="font-size: 2.2rem; color: var(--secondary); margin: 0.2rem 0 0; font-weight: 800;">{{ score }} Puntos</h3>
                  <span style="font-size: 0.95rem; color: var(--text-muted); display: block; margin-top: 6px;">
                    Tiempo Total: <strong>{{ formattedTime }}</strong>
                  </span>
                </div>
                <br>
                <button class="btn btn-primary" @click="confirmExit" style="padding: 14px 32px; font-size: 1.15rem;">Volver al Inicio</button>
              </div>
            </transition>

          </main>

          <!-- Panel Flotante de la CALCULADORA CIENTÍFICA -->
          <transition name="fade">
            <div v-if="showCalculator" class="glass-panel calculator-panel" style="position: absolute; right: 20px; top: 10px; width: 340px; z-index: 100; padding: 1.2rem; box-shadow: 0 12px 40px rgba(0,0,0,0.25); border: 2px solid rgba(79,70,229,0.3); background: rgba(255,255,255,0.95); border-radius: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem;">
                <h3 style="font-size: 1rem; color: var(--primary); margin: 0; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                  🧮 Panel de Herramientas
                </h3>
                <button @click="showCalculator = false" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--text-muted);">×</button>
              </div>

              <!-- Selector de Pestañas (Calculadora vs Conversor) -->
              <div style="display: flex; gap: 4px; margin-bottom: 0.8rem; background: var(--calc-tab-wrapper-bg); padding: 3px; border-radius: 10px;">
                <button 
                  @click="activeTab = 'calc'" 
                  :style="{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'calc' ? 'var(--calc-tab-bg-active)' : 'var(--calc-tab-bg-inactive)',
                    color: activeTab === 'calc' ? 'var(--calc-tab-text-active)' : 'var(--calc-tab-text-inactive)',
                    boxShadow: activeTab === 'calc' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }"
                >
                  🧮 Operaciones
                </button>
                <button 
                  @click="activeTab = 'converter'" 
                  :style="{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === 'converter' ? 'var(--calc-tab-bg-active)' : 'var(--calc-tab-bg-inactive)',
                    color: activeTab === 'converter' ? 'var(--calc-tab-text-active)' : 'var(--calc-tab-text-inactive)',
                    boxShadow: activeTab === 'converter' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }"
                >
                  🔄 Conversor
                </button>
              </div>
              
              <!-- Tab 1: Calculadora Científica -->
              <div v-if="activeTab === 'calc'">
                <!-- Pantalla de la calculadora -->
                <div style="background: var(--calc-screen-bg); color: var(--calc-screen-text); border-radius: 12px; padding: 10px 14px; text-align: right; font-family: monospace; font-size: 1.2rem; margin-bottom: 0.8rem; min-height: 52px; word-break: break-all; display: flex; flex-direction: column; justify-content: center;">
                  <div style="font-size: 0.85rem; color: #94a3b8; opacity: 0.8; height: 16px;">{{ calcExpression }}</div>
                  <div style="font-weight: 700; font-size: 1.3rem;">{{ calcDisplay || '0' }}</div>
                </div>

                <!-- Teclas de la calculadora (Grid 5x7) -->
                <div class="calc-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px;">
                  <button @click="pressCalcKey('sin(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">sin</button>
                  <button @click="pressCalcKey('cos(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">cos</button>
                  <button @click="pressCalcKey('tan(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">tan</button>
                  <button @click="pressCalcKey('sqrt(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">√</button>
                  <button @click="pressCalcKey('^')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">xʸ</button>

                  <button @click="pressCalcKey('asin(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">asin</button>
                  <button @click="pressCalcKey('acos(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">acos</button>
                  <button @click="pressCalcKey('atan(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">atan</button>
                  <button @click="pressCalcKey('fact(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">x!</button>
                  <button @click="pressCalcKey('abs(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">abs</button>

                  <button @click="pressCalcKey('log(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">log</button>
                  <button @click="pressCalcKey('ln(')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">ln</button>
                  <button @click="pressCalcKey('pi')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">π</button>
                  <button @click="pressCalcKey('e')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">e</button>
                  <button @click="pressCalcKey('%')" class="calc-btn fn" style="font-size: 0.8rem; padding: 8px 0;">mod</button>

                  <button @click="pressCalcKey('(')" class="calc-btn fn" style="font-size: 0.85rem; padding: 8px 0;">(</button>
                  <button @click="pressCalcKey(')')" class="calc-btn fn" style="font-size: 0.85rem; padding: 8px 0;">)</button>
                  <button @click="pressCalcKey('C')" class="calc-btn clear" style="font-size: 0.85rem; padding: 8px 0;">C</button>
                  <button @click="pressCalcKey('Del')" class="calc-btn clear" style="font-size: 0.85rem; padding: 8px 0;">⌫</button>
                  <button @click="pressCalcKey('/')" class="calc-btn op" style="font-size: 0.85rem; padding: 8px 0;">÷</button>

                  <button @click="pressCalcKey('7')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">7</button>
                  <button @click="pressCalcKey('8')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">8</button>
                  <button @click="pressCalcKey('9')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">9</button>
                  <button @click="pressCalcKey('*')" class="calc-btn op" style="font-size: 0.85rem; padding: 8px 0;">×</button>
                  <button @click="pressCalcKey('-')" class="calc-btn op" style="font-size: 0.85rem; padding: 8px 0;">-</button>

                  <button @click="pressCalcKey('4')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">4</button>
                  <button @click="pressCalcKey('5')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">5</button>
                  <button @click="pressCalcKey('6')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">6</button>
                  <button @click="pressCalcKey('+')" class="calc-btn op" style="font-size: 0.85rem; padding: 8px 0;">+</button>
                  <button @click="pressCalcKey('=')" class="calc-btn eq" style="grid-row: span 2; height: 100%; font-size: 1.1rem;">=</button>

                  <button @click="pressCalcKey('1')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">1</button>
                  <button @click="pressCalcKey('2')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">2</button>
                  <button @click="pressCalcKey('3')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">3</button>
                  <button @click="pressCalcKey('0')" class="calc-btn num" style="grid-column: span 2; font-size: 0.9rem; padding: 8px 0;">0</button>
                  <button @click="pressCalcKey('.')" class="calc-btn num" style="font-size: 0.9rem; padding: 8px 0;">.</button>
                </div>
              </div>

              <!-- Tab 2: Comparador de Unidades de Física y Matemáticas -->
              <div v-else style="display: flex; flex-direction: column; gap: 0.8rem;">
                <!-- Seleccionar Categoría -->
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Categoría de Conversión</label>
                  <select 
                    v-model="convertCategory" 
                    style="width: 100%; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--glass-border); font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.85rem; color: var(--text-main); background: white; cursor: pointer; outline: none; box-shadow: var(--glass-shadow);"
                  >
                    <option value="longitud">📏 Longitud (Metros, Pulgadas, Millas...)</option>
                    <option value="angulos">📐 Ángulos (Radianes, Grados)</option>
                    <option value="velocidad">⚡ Velocidad (m/s, km/h, mph)</option>
                  </select>
                </div>

                <!-- Valor e Input -->
                <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 8px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Valor a Comparar</label>
                    <input 
                      type="number" 
                      v-model="convertValue" 
                      placeholder="1"
                      style="width: 100%; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--glass-border); font-family: monospace; font-size: 0.95rem; font-weight: 700; color: var(--text-main); background: white; text-align: right; outline: none; box-shadow: var(--glass-shadow);"
                    />
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Desde Unidad</label>
                    <select 
                      v-model="convertFrom" 
                      style="width: 100%; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--glass-border); font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.85rem; color: var(--text-main); background: white; cursor: pointer; outline: none; box-shadow: var(--glass-shadow);"
                    >
                      <option 
                        v-for="unit in CATEGORY_UNITS[convertCategory]" 
                        :key="unit.id" 
                        :value="unit.id"
                      >
                        {{ unit.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Lista de Comparación Comparativa -->
                <div style="margin-top: 0.2rem;">
                  <label style="font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.5px;">
                    📋 Valores Comparados Simultáneamente
                  </label>
                  <div style="background: rgba(0,0,0,0.03); border-radius: 12px; padding: 6px 10px; display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;" class="sidebar-scroll">
                    <div 
                      v-for="res in comparisonResults" 
                      :key="res.id"
                      style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,0.04); font-size: 0.85rem; border-radius: 6px;"
                      :style="{ 
                        fontWeight: res.id === convertFrom ? '800' : '600', 
                        color: res.id === convertFrom ? 'white' : 'var(--text-main)',
                        background: res.id === convertFrom ? 'linear-gradient(135deg, var(--primary), #818cf8)' : 'transparent',
                        padding: res.id === convertFrom ? '6px 10px' : '6px 8px'
                      }"
                    >
                      <span style="font-size: 0.8rem;">{{ res.name }}</span>
                      <span style="font-family: monospace; font-size: 0.9rem; font-weight: 700;">{{ res.value }}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </transition>

          <!-- Panel Flotante del FORMULARIO CIENTÍFICO -->
          <transition name="fade">
            <div v-if="showFormulario" class="glass-panel formula-panel" style="position: absolute; right: 20px; top: 10px; width: 380px; z-index: 99; padding: 1.2rem; box-shadow: 0 12px 40px rgba(0,0,0,0.25); border: 2px solid rgba(16, 185, 129, 0.3); background: rgba(255,255,255,0.94); max-height: 80vh; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.4rem; flex-shrink: 0;">
                <h3 style="font-size: 1rem; color: #065f46; margin: 0; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                  📖 Formulario de Estudio EXCOBA
                </h3>
                <button @click="showFormulario = false" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--text-muted);">×</button>
              </div>
              
              <div style="overflow-y: auto; flex: 1; padding-right: 5px; display: flex; flex-direction: column; gap: 1rem;" class="sidebar-scroll">
                
                <div class="formula-category">
                  <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Álgebra y Funciones</h4>
                  <div class="formula-item">
                    <span class="formula-title">Fórmula general cuadrática:</span>
                    <div v-latex="'$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Binomio al cuadrado:</span>
                    <div v-latex="'$$(a \\pm b)^2 = a^2 \\pm 2ab + b^2$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Término general aritmético:</span>
                    <div v-latex="'$$a_n = a_1 + (n - 1)d$$'"></div>
                  </div>
                </div>

                <div class="formula-category">
                  <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Geometría y Trigonometría</h4>
                  <div class="formula-item">
                    <span class="formula-title">Teorema de Pitágoras:</span>
                    <div v-latex="'$$c^2 = a^2 + b^2$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Área del círculo:</span>
                    <div v-latex="'$$A = \\pi r^2$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Razones trigonométricas:</span>
                    <div v-latex="'$$\\sin(\\theta)=\\frac{C_o}{H}, \\quad \\cos(\\theta)=\\frac{C_a}{H}$$'"></div>
                  </div>
                </div>

                <div class="formula-category">
                  <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Geometría Analítica</h4>
                  <div class="formula-item">
                    <span class="formula-title">Pendiente de una recta:</span>
                    <div v-latex="'$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Ecuación de la circunferencia:</span>
                    <div v-latex="'$$(x - h)^2 + (y - k)^2 = r^2$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Ecuación de la elipse (horizontal):</span>
                    <div v-latex="'$$\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$$'"></div>
                  </div>
                </div>

                <div class="formula-category">
                  <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Cálculo Diferencial e Integral</h4>
                  <div class="formula-item">
                    <span class="formula-title">Límite notable trigonométrico:</span>
                    <div v-latex="'$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Derivada de una potencia:</span>
                    <div v-latex="'$$\\frac{d}{dx}[x^n] = n x^{n-1}$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Derivada de un producto de funciones:</span>
                    <div v-latex="'$$(u \\cdot v)\' = u\'v + u v\'$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Integral definida (TFC):</span>
                    <div v-latex="'$$\\int_{a}^{b} f(x)dx = F(b) - F(a)$$'"></div>
                  </div>
                </div>

                <div class="formula-category">
                  <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Arquitectura & Diseño Temático</h4>
                  <div class="formula-item">
                    <span class="formula-title">La Proporción Áurea (Número de Oro):</span>
                    <div v-latex="'$$\\Phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618033$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Ley de la Iluminación (Nivel de Lux):</span>
                    <div v-latex="'$$E = \\frac{I}{d^2}$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Relación de Escalas de Dibujo Técnico:</span>
                    <div v-latex="'$$\\text{Escala} = \\frac{\\text{Medida del Dibujo}}{\\text{Medida Real}}$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Relación de Esbeltez de una Columna:</span>
                    <div v-latex="'$$\\lambda = \\frac{L_e}{r}$$'"></div>
                  </div>
                </div>

                <div class="formula-category">
                  <h4 style="color: var(--primary); font-size: 0.9rem; font-weight: 800; border-left: 3px solid var(--primary); padding-left: 6px; margin-bottom: 0.5rem; text-transform: uppercase;">Física Científica</h4>
                  <div class="formula-item">
                    <span class="formula-title">Segunda Ley de Newton:</span>
                    <div v-latex="'$$F = m \\cdot a$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Presión mecánica:</span>
                    <div v-latex="'$$P = \\frac{F}{A}$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Calor sensible sensible:</span>
                    <div v-latex="'$$Q = m \\cdot c \\cdot \\Delta T$$'"></div>
                  </div>
                  <div class="formula-item">
                    <span class="formula-title">Ley de Coulomb:</span>
                    <div v-latex="'$$F = k \\frac{q_1 q_2}{r^2}$$'"></div>
                  </div>
                </div>

              </div>
            </div>
          </transition>

        </div>

      </div>
    </transition>

    <!-- Feedback Overlay -->
    <transition name="slide-up">
      <FeedbackOverlay 
        v-if="showFeedback && currentScreen === 'exam'"
        :is-correct="lastAnswerCorrect"
        :explanation="currentQuestion.explanation"
        :correct-option-text="correctOptionText"
        @continue="nextQuestion"
      />
    </transition>

    <!-- 3. MENÚ DE PAUSA DIFUMINADO & ADVERTENCIA -->
    <transition name="fade">
      <div v-if="isPaused" class="pause-overlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1000; display: flex; align-items: center; justify-content: center;">
        
        <!-- Contenedor del Menú de Pausa (Glassmorphic) -->
        <div v-if="!showExitWarning" class="glass-panel pause-menu-card" style="max-width: 420px; width: 90%; padding: 2.5rem 2rem; text-align: center; display: flex; flex-direction: column; gap: 1.8rem; box-shadow: 0 30px 60px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.3); border-radius: 24px;">
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 3.5rem; margin-bottom: 0.5rem; animation: pulse 2.5s infinite;">⏸️</div>
            <h2 style="font-size: 1.8rem; color: var(--text-main); margin: 0; font-weight: 800;">Prueba Pausada</h2>
            <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
              Tu tiempo de examen se ha detenido en <strong>{{ formattedTime }}</strong>.
            </p>
            
            <!-- Cronómetros de Pausa -->
            <div style="display: flex; flex-direction: column; gap: 8px; margin: 0.5rem auto;">
              <div class="glass-panel" style="padding: 8px 18px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: rgba(239, 68, 68, 0.06); border-color: rgba(239, 68, 68, 0.2); border-style: solid; border-width: 1px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted);">
                  Tiempo de esta pausa: <strong style="font-family: monospace; font-size: 1rem; color: #ef4444; margin-left: 2px;">{{ formattedCurrentPauseTime }}</strong>
                </span>
              </div>
              <div class="glass-panel" style="padding: 6px 14px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: rgba(245, 158, 11, 0.06); border-color: rgba(245, 158, 11, 0.2); border-style: solid; border-width: 1px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">
                  Tiempo total acumulado: <strong style="font-family: monospace; font-size: 0.9rem; color: #d97706; margin-left: 2px;">{{ formattedTotalPauseTime }}</strong>
                </span>
              </div>
            </div>

            <!-- Selector de Tema en Pausa -->
            <div style="margin: 0.2rem auto 0 auto; display: flex; justify-content: center;">
              <button @click="toggleTheme" class="btn glass-panel theme-toggle-btn" style="padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.3s ease; border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow); font-weight: 700;">
                <span v-if="isDarkMode">☀️ Modo Claro</span>
                <span v-else>🌙 Modo Oscuro</span>
              </button>
            </div>

            <p style="font-size: 0.95rem; color: var(--text-muted); margin: 0;">¿Listo para continuar?</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
            <!-- Continuar -->
            <button @click="resumeExam" class="btn btn-secondary" style="padding: 12px 20px; border-radius: 14px; font-weight: 700; width: 100%; font-size: 1.05rem;">
              ▶ Continuar Prueba
            </button>
            
            <!-- Regresar al menú principal -->
            <button @click="showExitWarning = true" class="btn btn-pause-exit" style="padding: 12px 20px; border-radius: 14px; font-weight: 700; width: 100%; border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.03); color: var(--text-muted); cursor: pointer; font-size: 0.95rem; transition: all 0.2s;">
              🏠 Salir al Menú Principal
            </button>
          </div>

        </div>

        <!-- 4. DIÁLOGO DE ADVERTENCIA DE SALIDA -->
        <div v-else class="glass-panel warning-card" style="max-width: 440px; width: 90%; padding: 2.5rem 2.2rem; text-align: center; display: flex; flex-direction: column; gap: 1.8rem; box-shadow: 0 35px 70px rgba(0,0,0,0.35); border: 2px solid #ef4444; border-radius: 24px;">
          
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 3.5rem; margin-bottom: 0.5rem; animation: shake 1s infinite alternate;">⚠️</div>
            <h2 style="font-size: 1.7rem; color: #ef4444; margin: 0; font-weight: 800;">¿Seguro que deseas salir?</h2>
            <p style="font-size: 1rem; color: var(--text-main); font-weight: 700; line-height: 1.5; margin: 0;">
              Si regresas al menú principal, perderás todo tu avance actual, puntos acumulados y tiempo transcurrido en esta sesión.
            </p>
          </div>

          <div style="display: flex; gap: 12px; width: 100%;">
            <!-- Cancelar Salida y Seguir Estudiando -->
            <button @click="showExitWarning = false" class="btn btn-secondary" style="flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.95rem;">
              No, continuar
            </button>
            
            <!-- Confirmar Salida y Reiniciar -->
            <button @click="confirmExit" class="btn btn-danger" style="flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; background: #ef4444; color: white; border: none; cursor: pointer; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); transition: all 0.2s;">
              Sí, salir y reiniciar
            </button>
          </div>

        </div>

      </div>
    </transition>

  </div>
</template>

<script>
const { ref, computed, watch } = Vue;

const { loadModule } = window['vue3-sfc-loader'];
const options = window.__SFC_OPTIONS__;

export default {
  components: {
    QuizView: Vue.defineAsyncComponent(() => loadModule('./components/QuizView.vue', options)),
    FeedbackOverlay: Vue.defineAsyncComponent(() => loadModule('./components/FeedbackOverlay.vue', options))
  },
  setup() {
    // --- Composable Injection (DI pattern via window) ---
    const timer = window.useTimer();
    const scoring = window.useScoring();
    const theme = window.useTheme();
    const bank = window.useQuestionBank();
    const calc = window.useCalculator();

    // --- Local UI State ---
    const currentScreen = ref(localStorage.getItem('excoba_current_screen') || 'menu');
    const isPaused = ref(false);
    const showExitWarning = ref(false);
    const showFeedback = ref(false);
    const lastAnswerCorrect = ref(false);
    const sidebarCollapsed = ref(false);

    const expandedSections = ref({
      Primaria: true,
      Secundaria: true,
      Bachillerato: true
    });

    watch(currentScreen, (newVal) => {
      localStorage.setItem('excoba_current_screen', newVal);
    });

    // Dynamic Background Theme based on Section
    watch([currentScreen, () => bank.currentQuestion.value?.section], ([screen, section]) => {
      document.body.classList.remove('section-primaria', 'section-secundaria', 'section-bachillerato');
      if (screen === 'exam' && section) {
        const sectionClass = 'section-' + section.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        document.body.classList.add(sectionClass);
      }
    }, { immediate: true });

    // Auto-resume timer on load if we are on active exam screen and have loaded questions
    if (currentScreen.value === 'exam' && bank.questions.value.length > 0) {
      timer.startTimer();
    }

    const toggleSection = (name) => {
      expandedSections.value[name] = !expandedSections.value[name];
    };

    // --- Exam Flow Orchestration ---
    const startExam = () => {
      bank.buildExamBank();
      bank.resetBank();
      scoring.resetScoring();
      timer.resetTimers();
      showFeedback.value = false;
      isPaused.value = false;
      showExitWarning.value = false;
      currentScreen.value = 'exam';
      timer.startTimer();
    };

    const resumeExamFromMenu = () => {
      currentScreen.value = 'exam';
      timer.startTimer();
    };

    const pauseExam = () => {
      isPaused.value = true;
      timer.stopTimer();
      timer.startPausedTimer();
    };

    const resumeExam = () => {
      isPaused.value = false;
      showExitWarning.value = false;
      timer.stopPausedTimer();
      timer.startTimer();
    };

    const confirmExit = () => {
      timer.resetTimers();
      isPaused.value = false;
      showExitWarning.value = false;
      currentScreen.value = 'menu';
      bank.resetBank();
      scoring.resetScoring();
      showFeedback.value = false;
      expandedSections.value = { Primaria: true, Secundaria: true, Bachillerato: true };
      localStorage.removeItem('excoba_current_screen');
    };

    // --- Answer & Hint Handlers (Mediator pattern) ---
    const handleHint = () => {
      if (bank.currentQuestion.value) {
        scoring.applyHint(bank.currentQuestion.value.id);
      }
    };

    const handleAnswer = (result) => {
      lastAnswerCorrect.value = result.isCorrect;
      scoring.applyAnswer(result.isCorrect);
      bank.recordAnswer(bank.currentQuestion.value.id, result);
      showFeedback.value = true;
    };

    const nextQuestion = () => {
      showFeedback.value = false;
      const prevSection = bank.currentQuestion.value?.section ?? '';
      bank.currentQuestionIndex.value++;

      if (bank.currentQuestionIndex.value >= bank.totalQuestions.value) {
        timer.stopTimer();
      } else if (bank.currentQuestion.value?.section !== prevSection) {
        expandedSections.value[bank.currentQuestion.value.section] = true;
      }
    };

    const prevQuestion = () => {
      if (bank.currentQuestionIndex.value > 0) {
        showFeedback.value = false;
        bank.currentQuestionIndex.value--;
        expandedSections.value[bank.currentQuestion.value.section] = true;
      }
    };

    const nextQuestionNav = () => {
      if (bank.currentQuestionIndex.value < bank.totalQuestions.value - 1) {
        showFeedback.value = false;
        bank.currentQuestionIndex.value++;
        expandedSections.value[bank.currentQuestion.value.section] = true;
      }
    };

    const jumpToQuestion = (idx) => {
      showFeedback.value = false;
      bank.currentQuestionIndex.value = idx;
      if (bank.currentQuestion.value) {
        expandedSections.value[bank.currentQuestion.value.section] = true;
      }
    };

    // --- Public API (flat spread for template simplicity) ---
    return {
      // Question bank
      questions: bank.questions,
      currentQuestionIndex: bank.currentQuestionIndex,
      currentQuestion: bank.currentQuestion,
      correctOptionText: bank.correctOptionText,
      totalQuestions: bank.totalQuestions,
      progressPercentage: bank.progressPercentage,
      sectionsData: bank.sectionsData,
      answeredStatus: bank.answeredStatus,
      activeSectionTotal: bank.activeSectionTotal,
      activeSectionSolved: bank.activeSectionSolved,
      activeSectionProgress: bank.activeSectionProgress,
      activeTopicTotal: bank.activeTopicTotal,
      activeTopicSolved: bank.activeTopicSolved,
      activeTopicProgress: bank.activeTopicProgress,
      overallSolvedCount: bank.overallSolvedCount,
      getSectionProgressText: bank.getSectionProgressText,
      getTopicProgressText: bank.getTopicProgressText,
      cleanQuestionTextFull: bank.cleanQuestionText,

      // Scoring
      score: scoring.score,
      hintsUsedStatus: scoring.hintsUsedStatus,
      handleAnswer,
      handleHint,

      // Timer
      formattedTime: timer.formattedTime,
      formattedCurrentPauseTime: timer.formattedCurrentPauseTime,
      formattedTotalPauseTime: timer.formattedTotalPauseTime,

      // Theme
      isDarkMode: theme.isDarkMode,
      toggleTheme: theme.toggleTheme,

      // Calculator
      showCalculator: calc.showCalculator,
      showFormulario: calc.showFormulario,
      toggleCalculator: calc.toggleCalculator,
      toggleFormulario: calc.toggleFormulario,
      calcDisplay: calc.calcDisplay,
      calcExpression: calc.calcExpression,
      pressCalcKey: calc.pressCalcKey,
      activeTab: calc.activeTab,
      convertCategory: calc.convertCategory,
      convertValue: calc.convertValue,
      convertFrom: calc.convertFrom,
      CATEGORY_UNITS: calc.CATEGORY_UNITS,
      comparisonResults: calc.comparisonResults,

      // UI state
      currentScreen,
      isPaused,
      showExitWarning,
      showFeedback,
      lastAnswerCorrect,
      sidebarCollapsed,
      expandedSections,
      toggleSection,

      // Flow
      startExam,
      resumeExamFromMenu,
      pauseExam,
      resumeExam,
      confirmExit,
      nextQuestion,
      prevQuestion,
      nextQuestionNav,
      jumpToQuestion
    };
  }
}
</script>

const server = Bun.serve({
  port: 1500,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    if (path === "/") path = "/index.html";
    
    // Servir archivos desde la carpeta del proyecto de manera absoluta
    const file = Bun.file(`C:/git/excoba${path}`);
    const exists = await file.exists();
    if (!exists) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(file);
  },
});

console.log(`🚀 Servidor EXCOBA corriendo en http://localhost:${server.port}`);

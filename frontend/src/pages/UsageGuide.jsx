export default function UsageGuide() {
  return (
    <main className="page">
      <section className="container guide-container">
        <h1>Nyomda Webshop Demo</h1>

        <h2>Leírás</h2>
        <p>Egy moduláris, nyomdai webshop MVP rendszer React + FastAPI stacken.</p>

        <h2>Fő funkciók</h2>
        <ul>
          <li>Termékkatalógus képekkel</li>
          <li>Dinamikus árkalkulátor (anchor ár alapú)</li>
          <li>Kosár rendszer</li>
          <li>Fájlfeltöltés</li>
          <li>Ajánlatkérés</li>
          <li>Admin dashboard</li>
          <li>Bulk anchor ár kezelés</li>
        </ul>

        <h2>Tech stack</h2>
        <ul>
          <li>React (Vite)</li>
          <li>FastAPI</li>
          <li>REST API</li>
          <li>Context API</li>
          <li>LocalStorage</li>
          <li>File upload (multipart)</li>
          <li>Sticky table UX</li>
        </ul>

        <h2>Architektúra</h2>
        <p>Frontend + Backend külön mappában fut, HTTP API kapcsolattal.</p>

        

        <h2>API endpoint lista</h2>
        <ul>
          <li>GET /health</li>
          <li>GET /products</li>
          <li>GET /products/{"{slug}"}</li>
          <li>GET /catalog</li>
          <li>POST /price/calculate</li>
          <li>POST /quote/calculate</li>
          <li>POST /quote</li>
          <li>POST /upload</li>
          <li>GET /uploads/{"{storedName}"}</li>
          <li>GET /anchors</li>
          <li>PATCH /anchors/bulk</li>
          <li>DELETE /anchors/bulk</li>
          <li>POST /admin/anchors</li>
          <li>PUT /admin/anchors/{"{id}"}</li>
          <li>DELETE /admin/anchors/{"{id}"}</li>
          <li>GET /admin/orders</li>
          <li>GET /admin/orders/{"{id}"}</li>
          <li>PATCH /admin/orders/{"{id}"}</li>
          <li>PATCH /admin/orders/bulk-status</li>
        </ul>

        
      </section>
    </main>
  );
}


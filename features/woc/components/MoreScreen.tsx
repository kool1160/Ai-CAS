export function MoreScreen() {
  return (
    <section className="stack">
      <div className="screen-title">
        <h1>More</h1>
        <p>Settings, help, and system information placeholders.</p>
      </div>
      <article className="card">
        <h2>Settings / Help</h2>
        <p>Future settings can live here without disrupting the main correction workflow.</p>
        <div className="placeholder-list" style={{ marginTop: 14 }}>
          <div className="placeholder-item">
            <strong>System Purpose</strong>
            <span>Fix bad router data before it becomes waste.</span>
          </div>
          <div className="placeholder-item">
            <strong>Build Status</strong>
            <span>Milestone 7: Component cleanup / structure split.</span>
          </div>
        </div>
      </article>
    </section>
  );
}

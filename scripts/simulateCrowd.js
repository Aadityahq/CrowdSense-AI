const zones = ["A1", "A2", "B1", "B2", "C1", "C2"];

setInterval(() => {
  const snapshot = zones.map((zone) => ({
    zone,
    density: Math.floor(Math.random() * 100),
    queue: Math.floor(Math.random() * 25)
  }));

  console.log(JSON.stringify(snapshot));
}, 3000);

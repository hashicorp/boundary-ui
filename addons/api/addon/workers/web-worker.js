onmessage = (e) => {
  console.log(`Received from main: ${e.data}`);
  postMessage('New data');
};

/* Streamlit custom-component handshake and responsive height updates. */
(() => {
  if (window.parent === window) return;
  const send = (type, payload = {}) => window.parent.postMessage(
    {isStreamlitMessage: true, type, ...payload}, '*'
  );
  let previousHeight = 0;
  const resize = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height) + 8;
    if (height !== previousHeight) {
      previousHeight = height;
      send('streamlit:setFrameHeight', {height});
    }
  };
  window.addEventListener('message', event => {
    if (event.source === window.parent && event.data?.type === 'streamlit:render') resize();
  });
  send('streamlit:componentReady', {apiVersion: 1});
  new ResizeObserver(resize).observe(document.body);
  window.addEventListener('load', resize);
  resize();
})();

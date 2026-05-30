if (document.querySelector('.mermaid')) {
  const script = document.createElement('script');
  script.src = '/assets/vendor/mermaid/mermaid.min.js';
  script.onload = () => {
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        themeVariables: {
          primaryColor: '#eaeae5',
          primaryTextColor: '#0a0a0a',
          primaryBorderColor: '#d0d0cb',
          lineColor: '#737373',
          fontFamily: 'Inter, sans-serif',
        },
      });
    }
  };
  script.onerror = () => {
    document.documentElement.classList.add('mermaid-unavailable');
    console.warn('Mermaid failed to load.');
  };
  document.head.appendChild(script);
}

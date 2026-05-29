if (document.querySelector('.mermaid')) {
  try {
    const { default: mermaid } = await import('/assets/vendor/mermaid/mermaid.esm.min.mjs');

    mermaid.initialize({
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
  } catch (error) {
    document.documentElement.classList.add('mermaid-unavailable');
    console.warn('Mermaid failed to load.', error);
  }
}

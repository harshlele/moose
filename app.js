const url = 'http://example.org';

window.addEventListener('load', async () => {
    const pageText = await window.electronAPI.loadUrl(url);
    console.log(pageText);
});


const { app, BrowserWindow } = require('electron');
const {Url} = require('./Url');

const printPage = (page) => {
    let resp = '';
    let in_tag = false;
    for (let char of page){
        if(char == '<')
            in_tag = true;
        else if(char == '>')
            in_tag = false;
        else if(in_tag == false)
            resp += char;
    }
    
    
    resp = handleEntities(resp);
    
    console.log(resp);
}

/**
 * 
 * @param {string} page 
 * @returns the page text, with entities replaced with special characters
 */
const handleEntities = (page) => {
    return page.replace(new RegExp(/&lt;/,'g'),'<').replace(new RegExp(/&gt;/, 'g'),'>');
}

const printSource = (page) => {
    console.log(handleEntities(page));
}

const loadUrl = async () => {
    let url = new Url('http://browser.engineering/redirect3');
    
    for(let i = 0; i < 10; i++){
        url.print();
        let resp = await url.request();
        if(resp.err){
            console.error(resp.err);
            break;
        }
        else{
            if(resp.headers.status >= 300 && resp.headers.status < 400){
                url = new Url(resp.headers.location);
            }
            else{
                console.log('Url connect response');
                
                if(url.scheme == 'view-source')
                    printSource(resp.response);
                else
                    printPage(resp.response);
                break;
            }
        }
    }
    
}

const createWindow = () => {
        const win = new BrowserWindow({
            width: 800,
            height: 600
        })

        win.loadFile('index.html');
        loadUrl();
    }

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });
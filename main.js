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
    console.log(resp);
}

const createWindow = () => {
        const win = new BrowserWindow({
            width: 800,
            height: 600
        })

        win.loadFile('index.html');
        let url = new Url('data:text/html,Hello World');
        url.print();
        url.request().then(res => {
            console.log('Url connect response');
            printPage(res);
        });
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
const {app, BrowserWindow, globalShortcut, ipcMain, dialog } =require('electron');//引入electron

let win;
let windowConfig = {
    width:1280,
    height:1024,
    resizable: true,
    // transparent: true,
    maximizable: false,
    minimizable: false,
    fullscreen: true, 
    hasShadow:false,
    frame: false,
    //electron 5.0以上需要添加
    webPreferences:{
      nodeIntegration: true 
    } 
};//窗口配置程序运行窗口的大小
const  {autoUpdater}=require('electron-updater');

function createWindow(){
  win = new BrowserWindow(windowConfig);//创建一个窗口
  console.log(`${__dirname}`,"${__dirname}")
  win.loadURL(`file://${__dirname}/index.html`);//在窗口内要展示的内容index.html 就是打包生成的index.html
  // win.loadURL('http://192.168.0.27:8081');
  // win.webContents.openDevTools();  //开启调试工具
  win.on('close',() => {
    //回收BrowserWindow对象
    win = null;
  })

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    let focusWin = BrowserWindow.getFocusedWindow()
    focusWin && focusWin.toggleDevTools()
  })



  // win.on('resize',() => {
  //   win.reload();
  // })
}

app.on('ready',createWindow)

app.on('window-all-closed',() => {
  app.quit();
});

app.on('activate',() => {
  if(win == null){
    createWindow();
  }
})

ipcMain.on('openServer', e=> {
  let exec = require('child_process').exec;
  exec('taskkill /im serialPort.exe /F',function(){
      const { spawn } = require('child_process')
      let subprocess = spawn('runserver\\serialPort.exe', [], {
        detached: true,
        stdio: 'inherit' // ['ignore', process.stdout, process.stderr]
      })
      subprocess.unref()
  });

  

  // setTimeout(function() {
    
  // }, 4000);
  // console.log(exec('taskkill /im serialPort.exe /F'))
 




})

ipcMain.on('max', e=> {
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})

ipcMain.on('close', e=> {
    win.close();
})

ipcMain.on('min', e=> {
    win.minimize();
})

ipcMain.on("update",()=>{
  //执行自动更新检查
  // let myNotification = new Notification('标题', {
  //   body: '通知正文内容'
  // });
  updateHandle();
})
function getPlatform(){
	if(process.arch.indexOf('x32')>=0){
		return 'win32';
	} else if(process.arch.indexOf('x64')>=0){
		return 'win64';		
	} else {
		return process.platform;
	}
}
const uploadUrl = `http://oa.91118.com:1337/update/flavor/evaluation/${getPlatform()}/stable`;
// const uploadUrl = `http://oa.91118.com:1337/update/flavor/evaluation/' +process.platform +'/stable';
console.log(getPlatform(),79);
const server = 'http://oa.91118.com:1337'
const feed = `${server}/update/flavor/evaluation/${getPlatform()}/stable`

//autoUpdater.setFeedURL(feed)

function updateHandle() {
  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新',
  };
  
  // const uploadUrl = "http://oa.91118.com/eval";
  //const uploadUrl = "http://192.168.0.211/eval";
  autoUpdater.setFeedURL(uploadUrl);

  autoUpdater.on('error', function (error) {
    console.log(error);
    // sendUpdateMessage("122344")
    // sendUpdateMessage(autoUpdater)
    sendUpdateMessage({
      message:message.error,
      flag: 'error',
      error
    })
  })

  autoUpdater.on('checking-for-update', function (info) {
    // sendUpdateMessage(autoUpdater,"abc");
    // sendUpdateMessage(uploadUrl+"-1")
    sendUpdateMessage({
      message:message.checking,
      flag: 'checking',
      info
    })
  })

  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage({
      message:message.updateAva,
      flag: 'avaliable',
      info
    })
  })

  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage({
      message:message.updateNotAva,
      flag: 'notAvaliable',
      info
    })
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    win.webContents.send('downloadProgress', progressObj)
  })

  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {

    ipcMain.on('updateNow', (e, arg) => {
      //some code here to handle event
      autoUpdater.quitAndInstall();
    });

    win.webContents.send('canUpdateNow',event);
    
    // const dialogOpts = {
    //   type: 'info',
    //   buttons: ['重启更新', '稍后'],
    //   title: '发现新版本',
    //   message: process.platform === 'win32' ? releaseNotes : releaseName,
    //   detail: '发现有新的版本，建议立即更新！'
    // }
  
    // dialog.showMessageBox(dialogOpts).then((returnValue) => {
    //   if (returnValue.response === 0) autoUpdater.quitAndInstall()
    // })
  })
    
  autoUpdater.checkForUpdates()
}


app.on('ready',function (){
  
  // updateHandle()
})


function sendUpdateMessage(text) {
  // console.log(text)
  win.webContents.send('message', text)
}


































































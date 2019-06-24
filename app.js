const express = require('express');
const app = express();
const http = require('http').Server(app)
const port = 8080;
const https = require('https');
const puppeteer = require('puppeteer-core');
const dotenv = require('dotenv').config();
const cmd = require('node-command-line');
const os = require('os');

var environment_data = {
  login_username:process.env.LOGIN_USERNAME,
  login_password:process.env.LOGIN_PASSWORD,
  chrome_path:process.env.CHROME_EXECUTABLE_PATH,
  wifi_ssid:process.env.WIFI_SSID,
  wifi_interface_name:process.env.WIFI_INTERFACE_NAME,
  current_os: os.platform()
};

async function processHandler() {
  var weHaveInternet = false;
  do {
    try {
      if (environment_data.current_os === 'win32') {
        await disableWiFi();
        console.log('wifi disabled');
        await enableWiFi();
        console.log('wifi enabled');
      }
      await connectoToWifi();
      await startProcess()
    } catch (e) {
      console.log('error');
      console.log('e.message:',e.message);
      console.log(e);
    } 
  } while (!weHaveInternet);
};

async function startProcess() {
  logCurrentTime();
  const browser = await puppeteer.launch({
    executablePath:environment_data.chrome_path,
    headless:true,
    slowMo:200, 
    devtools:true,
    ignoreHTTPSErrors: true
  });
  var page = await browser.newPage()
  await doLogin(page);
  await clickOnWAN(page);
  var hasInternet = await checkConectadoStatus(page);
  await disconnectOnInternet(hasInternet, browser);
  await clickOnMantenimiento(page);
  await clickOnDispositivo(page)
  await clickOnReset(page)
  await logCurrentTime();
  await page.waitFor(60000 * 5); //minutes
  await logCurrentTime();
  await browser.close();
};

async function doLogin(page){
  await page.waitFor(6000)
  await page.goto('https://192.168.1.1');
  await page.focus('#txt_Username');
  await page.keyboard.type(environment_data.login_username);
  await page.focus('#txt_Password');
  await page.keyboard.type(environment_data.login_password);
  await page.click('#btnLogin');
  console.log('logged in');
  return true;
};

async function clickOnWAN(page) {
  await page.waitFor("#listfrm");
  console.log('wan clicking');
  return await page.evaluate(()=>{
    var iframe = document.querySelector("#listfrm")
    var wanButton = iframe.contentDocument.querySelector("#link_Admin_0_1")
    console.log(iframe);
    console.log(wanButton);
    wanButton.click();
    return true;
  });
};

async function checkConectadoStatus(page) {
  await page.waitFor("#contentfrm");
  return await page.evaluate(()=>{
    var iframe = document.querySelector("#contentfrm");
    console.log(iframe);
    var textElement = iframe.contentDocument.querySelector("#Estado\\ de\\ la\\ conexión > table > tbody > tr:nth-child(4) > td:nth-child(2)").textContent
    var conectadoCheck = textElement ==="Conectado "? true : false;
    return conectadoCheck;
  });
};

async function disconnectOnInternet(hasInternet, browser) {
  if (hasInternet) {
    console.log('Tienes internet: ',hasInternet);
    console.log('\x1b[32m','YA TIENES INTERNET');
    await browser.close();
    process.exit();
  }
  return
};

async function clickOnMantenimiento(page) {
  console.log('NO TIENES INTERNET');
  console.log('mantenimiento clicking');
  return await page.evaluate(()=>{
    var iframe = document.querySelector("#listfrm")
    var mantenimientoButton = iframe.contentDocument.querySelector("#link_Admin_3")
    console.log(iframe);
    console.log(mantenimientoButton);
    mantenimientoButton.click();
    return true;
  });
};

async function clickOnDispositivo(page){
  console.log('dispositivo clicking');
  return await page.evaluate(()=>{
    var iframe = document.querySelector("#listfrm")
    var dispositivoButton = iframe.contentDocument.querySelector("#link_Admin_3_1")
    console.log(iframe);
    console.log(dispositivoButton);
    dispositivoButton.click();
    return true;
  });
};

async function clickOnReset(page){
  console.log('reset clicking');
  page.on('dialog', (dialog)=> {
    console.log('dialog detected');
    dialog.accept();
  });
  return await page.evaluate(()=>{
    var iframe = document.querySelector("#contentfrm")
    var resetButton = iframe.contentDocument.querySelector("body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > button")
    console.log(iframe);
    console.log(resetButton);
    resetButton.click();
    return true;
  });
};

async function logCurrentTime() {
  var date = new Date()
  var time = date.getHours() +':'+ date.getMinutes() +':' + date.getSeconds()
  console.log(time);
  return
};

async function disableWiFi() {
  return cmd.run(`netsh interface set interface name="${environment_data.wifi_interface_name}" admin=disabled`)
};

async function enableWiFi() {
  return cmd.run(`netsh interface set interface name="${environment_data.wifi_interface_name}" admin=enabled`)
};

async function connectoToWifi() {
  if (environment_data.current_os === 'linux') {
    return cmd.run(`nmcli -p con up id "${environment_data.wifi_ssid}"`);
  }else if (environment_data.current_os === 'win32') {
    return cmd.run(`netsh wlan connect ssid=${environment_data.wifi_ssid} name=${environment_data.wifi_ssid}`);
  } else {
    reject('Sistema operativo no soportado')
  }
};

http.listen(port,function (err) {
  if (err) return console.log(err);
  console.log(`Server corriendo en el puerto ${port}`);
  processHandler();
});

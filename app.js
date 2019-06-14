const express = require('express');
const app = express()
const http = require('http').Server(app)
const port = 8080;
const https = require('https');
const puppeteer = require('puppeteer-core');
const dotenv = require('dotenv').config();
const cmd = require('node-command-line');

var environment_data = {
  login_username:process.env.LOGIN_USERNAME,
  login_password:process.env.LOGIN_PASSWORD,
  chrome_path:process.env.CHROME_EXECUTABLE_PATH,
  wifi_ssid:process.env.WIFI_SSID
}

async function processHandler() {
  await startProcess()
}

async function startProcess() {
  const browser = await puppeteer.launch({
    executablePath:environment_data.chrome_path,
    headless:false,
    slowMo:150, 
    devtools:true,
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage()
  await page.goto('https://192.168.1.1');
  await page.focus('#txt_Username');
  await page.keyboard.type(environment_data.login_username);
  await page.focus('#txt_Password');
  await page.keyboard.type(environment_data.login_password);
  await page.click('#btnLogin')
  await page.waitFor("#listfrm");
  const wanClick = await page.evaluate(()=>{
    var iframe = document.querySelector("#listfrm")
    var wanButton = iframe.contentDocument.querySelector("#link_Admin_0_1")
    console.log(iframe);
    console.log(wanButton);
    wanButton.click();
    return wanButton;
  });
  await page.waitFor("#contentfrm")
  const hasInternet = await page.evaluate(()=>{
    var iframe = document.querySelector("#contentfrm");
    console.log(iframe);
    var textElement = iframe.contentDocument.querySelector("#Estado\\ de\\ la\\ conexión > table > tbody > tr:nth-child(4) > td:nth-child(2)").textContent
    var conectadoCheck = textElement ==="Conectado "? true : false;
    console.log({textElement});
    console.log({conectadoCheck});
    return conectadoCheck;
  });
  if (hasInternet) {
    console.log('YA TIENES INTERNET');
  } else {
    const mantenimientoClick = await page.evaluate(()=>{
      var iframe = document.querySelector("#listfrm")
      var mantenimientoButton = iframe.contentDocument.querySelector("#link_Admin_3")
      console.log(iframe);
      console.log(mantenimientoButton);
      mantenimientoButton.click();
      return mantenimientoButton;
    });
  }
  const dispositivoClick = await page.evaluate(()=>{
    var iframe = document.querySelector("#listfrm")
    var dispositivoButton = iframe.contentDocument.querySelector("#link_Admin_3_1")
    console.log(iframe);
    console.log(dispositivoButton);
    dispositivoButton.click();
    return dispositivoButton;
  });
  page.on('dialog', (dialog)=> {
    console.log('dialog detected');
    dialog.accept();
  });
  const resetClick = await page.evaluate(()=>{
    var iframe = document.querySelector("#contentfrm")
    var resetButton = iframe.contentDocument.querySelector("body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > button")
    console.log(iframe);
    console.log(resetButton);
    resetButton.click();
    return resetButton;
  });
  await page.waitFor(80000);
  await browser.close()
  cmd.run(`nmcli -p con up id "${environment_data.wifi_ssid}"`);
  processHandler();
};

http.listen(port,function (err) {
  if (err) return console.log(err);
  console.log(`Server corriendo en el puerto ${port}`);
  processHandler();
})

const locale = require("locale");

const showWidgets = false;

const timeFontSize = showWidgets ? 34 : 38;
const dateFontSize = showWidgets ? 18 : 20;
const smallFontSize = 20;
const font = "Vector";
const bgColor = [0.1, 0.1, 0.1];
const dayColor = [252/255, 216/255, 94/255];
const nightColor = [81/255, 149/255, 237/255];

const xyCenter = g.getWidth() / 2;
const yposTime = showWidgets ? 46 : 24;
const ymarginTime = 5;
const ymarginDate = showWidgets ? 0 : 2;
const yposDate = yposTime + (timeFontSize + ymarginTime) * 3 + ymarginDate;
const yposDml = 170;
const yposDayMonth = 195;
const yposGMT = 220;

const HR_CLICK_COUNT = 3; // number of taps
const HR_CLICK_PERIOD = 1; // second
let hrPow = 0;

const onesPlace = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty one", "twenty two", "twenty three"];
const tensPlace = ["o'", "teen", "twenty", "thirty", "forty", "fifty"];
const abbrevMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const abbrevDoW = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
// Check settings for what type our clock should be
let is12Hour = true; //(require("Storage").readJSON("setting.json",1)||{})["12hour"];

function getUTCTime(d) {
  return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d)});
}

function fillRoundedRect(x1, y1, x2, y2, r) {
  g.fillRect(x1+r, y1+r, x2-r, y2-r);
  //Top
  g.fillRect(x1+r, y1, x2-r, y1+r);
  //Bottom
  g.fillRect(x1+r, y2-r, x2-r, y2);
  //Left
  g.fillRect(x1, y1+r, x1+r, y2-r);
  //Right
  g.fillRect(x2-r, y1+r, x2, y2-r);

  //Top Left
  g.fillCircle(x1 + r, y1 + r, r);
  //Top Right
  g.fillCircle(x2 - r, y1 + r, r);
  //Bottom Left
  g.fillCircle(x2 - r, y2 - r, r);
  //Bottom Right
  g.fillCircle(x1 + r, y2 - r, r);
}

function fastRedraw() {
  drawTime();
  if(showWidgets) {
    //not enough room for bat bar?
    drawDivider();
  } else {
    drawBatBar();
  }

}
function slowRedraw() {
  drawDate();
}

let lastTimeString = "";

function meridian() {
  const d = new Date();
  const hour = d.getHours()
  return hour >= 12 ? "PM" : "AM";
}

function setColorByMeridian() {
  if(meridian() == "PM"){
    g.setColor(nightColor[0], nightColor[1], nightColor[2]);
  } else {
    g.setColor(dayColor[0], dayColor[1], dayColor[2]);
  }
}

function drawTime() {
  // get date
  const d = new Date();
  const da = d.toString().split(" ");
  const dutc = getUTCTime(d);

  const time = da[4].split(":");
  let hours = time[0],
    minutes = time[1],
    seconds = time[2];

  let meridian = "";
  if (is12Hour) {
    hours = parseInt(hours,10);
    meridian = "AM";
    if (hours == 0) {
      hours = 12;
      meridian = "AM";
    } else if (hours >= 12) {
      meridian = "PM";
      if (hours>12) hours -= 12;
    }
    hours = (" "+hours).substr(-2);
  }
  const hoursWord = onesPlace[parseInt(hours)];
  let minTensWord = "";
  let minOnesWord = "";
  if(parseInt(minutes) < 20 && parseInt(minutes) > 9) {
    minTensWord = onesPlace[parseInt(minutes)];
  } else {
    minTensWord = tensPlace[parseInt(minutes[0])];
    if(minutes[0] == "0" && minutes[1] == "0"){
      minOnesWord = "clock";
    } else {
      minOnesWord = onesPlace[parseInt(minutes[1])];
    }
  }
  const newTimeString = `${hoursWord}${minTensWord}${minOnesWord}`;
  
  if(newTimeString != lastTimeString) {
    g.clearRect(0, showWidgets ? 30 : 0, g.getWidth(), yposTime + (timeFontSize+ymarginTime)*3);
    g.setFontAlign(0, 0);
    g.setFont(font, timeFontSize);
    setColorByMeridian();
    g.drawString(`${hoursWord}`, xyCenter, yposTime, true);
    g.setColor(1,1,1);
    g.drawString(`${minTensWord}`, xyCenter, yposTime+(timeFontSize+ymarginTime), true);
    g.drawString(`${minOnesWord}`, xyCenter, yposTime+(timeFontSize+ymarginTime)*2, true);
  }
  lastTimeString = newTimeString; 
}

let lastDateString = "";

function drawDate() {
  // get date
  let d = new Date();
  const newDateString = `${d.getMonth()}${d.getDate()}`;
  if(newDateString != lastDateString){
    // draw date
    const width = showWidgets ? 66 : 72;
    const height = showWidgets ? 72 : 80;
    const borderWidth = 4;
    const borderTopWidth = 26;
    g.clearRect(xyCenter - width/2 - 2, yposDate, xyCenter + width/2 + 2, yposDate + height);
    g.setColor(0.6, 0.6, 0.7);
    fillRoundedRect(xyCenter - width/2, yposDate, xyCenter + width/2, yposDate + height, 2);
    g.setColor(bgColor[0], bgColor[1], bgColor[2]);
    fillRoundedRect(xyCenter - width/2 + borderWidth, yposDate + borderTopWidth, xyCenter + width/2 - borderWidth, yposDate + height - borderWidth, 4);
    g.setColor(1, 1, 1);
    g.setFont(font, dateFontSize-2);
    g.drawString(`${abbrevMonths[d.getMonth()]}`, xyCenter, yposDate+11, true);
    g.setFont(font, dateFontSize-4);
    g.drawString(`${abbrevDoW[d.getDay()]}`, xyCenter, yposDate + (showWidgets ? 34 : 38), true);
    g.setFont(font, dateFontSize);
    g.drawString(`${d.getDate()}`, xyCenter, yposDate + height - 18, true);
  }
  lastDateString = newDateString;
}

function drawHR(hrm) {
  //console.log(hrm);
  const x0 = 15;
  const y0 = yposDate + (showWidgets ? 5 : 10);
  const width = 55;
  const height = 55;
  g.clearRect(0, yposDate, 80, g.getHeight());
  if(hrPow){
    g.setColor(176/255, 44/255, 44/255);
    fillRoundedRect(x0, y0, x0+width, y0+height, 4);
  }
  g.setColor(1, 1, 1);
  g.setFont(font, 18);
  g.drawString("HR:", x0 + width/2, y0+15, true);
  g.setFont(font, 22);
  if(hrm && hrm.confidence > 80) {
    g.drawString(`${hrm.bpm}`, x0 + width/2, y0+38, true);
  }
  else {
    g.drawString(hrPow ? "??" : "off" , x0 + width/2, y0+38, true); 
  }
}

function drawDivider() {
  const brighten = 0.08;
  g.setColor(bgColor[0] + brighten, bgColor[1] + brighten, bgColor[2] + brighten);
  g.fillRect(0, yposDate - 12, g.getWidth(), yposDate - 12 + 1); 
}

let lastBatPct = 0;

function drawBatBar(day) {
  const batPct = E.getBattery() / 100;
  if(batPct != lastBatPct) {
    const ymarginBar = 16;
    const xmarginBar = 14;

    const barWidth = g.getWidth() - xmarginBar * 2;
    const barHeight = 6;

    const brighten = 0.04;
    g.setColor(bgColor[0] + brighten, bgColor[1] + brighten, bgColor[2] + brighten);
    fillRoundedRect(xmarginBar, yposDate - ymarginBar, xmarginBar+barWidth, yposDate - ymarginBar + barHeight, 3)
    setColorByMeridian();
    fillRoundedRect(xmarginBar, yposDate - ymarginBar, xmarginBar+(barWidth*batPct), yposDate - ymarginBar + barHeight, 3)
  }
  lastBatPct = batPct;
}

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (on) {
    fastRedraw();
    slowRedraw();
  }
});

// clean app screen
g.setBgColor(bgColor[0], bgColor[1], bgColor[2]);
g.clear();
if(showWidgets){
  g.setColor(bgColor[0], bgColor[1], bgColor[2]);
  g.fillRect(0, 25, g.getWidth(), g.getHeight());
  // Fills entire widget bar with black, so no gray peeks through
  g.setColor(0,0,0);
  g.fillRect(0, 0, g.getWidth(), 25);
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}

// refesh every half second
setInterval(fastRedraw, 500);
setInterval(slowRedraw, 5000);

// draw now
fastRedraw();
slowRedraw();
drawHR();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

let clickTimes = [];
setWatch(function(e) {
  while (clickTimes.length >= HR_CLICK_COUNT) {
    clickTimes.shift();
  }
  clickTimes.push(e.time);
  let clickPeriod = e.time-clickTimes[0];
  if (clickTimes.length == HR_CLICK_COUNT && clickPeriod< HR_CLICK_PERIOD) {
    toggleHR();
    clickTimes = [];
  }
}, BTN1, {repeat:true, edge:"rising"});

function toggleHR(){
  hrPow = !hrPow;
  Bangle.setHRMPower(hrPow);
  Bangle.setLCDTimeout(!hrPow);
  if(hrPow){
    drawHR();
    Bangle.on('HRM',function(hrm) {
      drawHR(hrm);
    });
  } else {
    drawHR();
  }
}

let _GB = global.GB;
global.GB = (event) => {
  switch (event.t) {
    case "notify":
      console.log(event);
      break;
    case "musicinfo":
      console.log(event);
      break;
    case "musicstate":
      console.log(event);
      break;
    case "call":
      console.log(event);
      break;
  }
  if(_GB)setTimeout(_GB,0,event);
};

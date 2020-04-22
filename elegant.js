var locale = require("locale");
const timeFontSize = 35;
const dateFontSize = 18;
const smallFontSize = 20;
const font = "Vector";
const bgColor = [0.1, 0.1, 0.1];
const dayColor = [252/255, 216/255, 94/255];
const nightColor = [81/255, 149/255, 237/255];

const xyCenter = g.getWidth() / 2;
const yposTime = 46;
const ymarginTime = 5;
const yposDate = yposTime + (timeFontSize + ymarginTime) * 3;
const yposDml = 170;
const yposDayMonth = 195;
const yposGMT = 220;

const HR_CLICK_COUNT = 3; // number of taps
const HR_CLICK_PERIOD = 1; // second
let hrPow = 0;

const onesPlace = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty one", "twenty two", "twenty three"];
const tensPlace = ["o'", "teen", "twenty", "thirty", "forty", "fifty"];
const abbrevMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Check settings for what type our clock should be
var is12Hour = true; //(require("Storage").readJSON("setting.json",1)||{})["12hour"];

function getUTCTime(d) {
  return d.toUTCString().split(' ')[4].split(':').map(function(d){return Number(d)});
}

function redraw() {
  g.setBgColor(bgColor[0], bgColor[1], bgColor[2]);
  drawTime();
  drawDate();
  drawDividers();
}

let lastTimeString = "";

function drawTime() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");
  var dutc = getUTCTime(d);

  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].split(":");
  var hours = time[0],
    minutes = time[1],
    seconds = time[2];

  var meridian = "";
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

  // Time
  g.setFont(font, timeFontSize);
  //g.drawString(`${hours}:${minutes}:${seconds}`, xyCenter, yposTime, true);
  const hoursWord = onesPlace[parseInt(hours)];
  let minTensWord = "";
  let minOnesWord = "";
  if(parseInt(minutes) < 20 && parseInt(minutes) > 9) {
    minTensWord = onesPlace[parseInt(minutes)];
  } else {
    minTensWord = tensPlace[parseInt(minutes[0])];
    minOnesWord = onesPlace[parseInt(minutes[1])];
  }
  const newTimeString = `${hoursWord}${minTensWord}${minOnesWord}`;
  
  if(newTimeString != lastTimeString) {
    g.clearRect(0, yposTime, g.getWidth(), yposTime + (timeFontSize+ymarginTime)*3);
    if(meridian == "PM"){
      g.setColor(nightColor[0], nightColor[1], nightColor[2]);
    } else {
      g.setColor(dayColor[0], dayColor[1], dayColor[2]);
    }
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
  var d = new Date();
  const newDateString = `${d.getMonth()}${d.getDate()}`;
  if(newDateString != lastDateString){
    // draw date
    const width = 66;
    const height = 66;
    const borderWidth = 4;
    const borderTopWidth = 26;
    g.clearRect(xyCenter - width/2, yposDate, xyCenter + width/2, yposDate + height);
    g.setColor(0.6, 0.6, 0.7);
    g.fillRect(xyCenter - width/2, yposDate, xyCenter + width/2, yposDate + height);
    g.setColor(bgColor[0], bgColor[1], bgColor[2]);
    g.fillRect(xyCenter - width/2 + borderWidth, yposDate + borderTopWidth, xyCenter + width/2 - borderWidth, yposDate + height - borderWidth);
    g.setColor(1, 1, 1);
    g.setFont(font, dateFontSize-2);
    g.drawString(`${abbrevMonths[d.getMonth() + 1]}`, xyCenter, yposDate+11, true);
    g.setFont(font, dateFontSize);
    g.drawString(`${d.getDate()}`, xyCenter, yposDate + height - 22, true);
  }
  lastDateString = newDateString;
}

function drawHR(hrm) {
  console.log(hrm);
  const x0 = 15;
  const y0 = yposDate + 5;
  const width = 55;
  const height = 55;
  g.clearRect(0, yposDate, 80, g.getHeight());
  if(hrPow){
    g.setColor(176/255, 44/255, 44/255);
    g.fillRect(x0, y0, x0+width, y0+height);
  }
  g.setColor(1, 1, 1);
  g.setFont(font, 18);
  g.drawString("HR:", x0 + width/2, y0+15, true);
  g.setFont(font, 22);
  if(hrm && hrm.confidence > 10) {
    g.drawString(`${hrm.bpm}`, x0 + width/2, y0+38, true);
  }
  else {
    g.drawString(hrPow ? "??" : "off" , x0 + width/2, y0+38, true); 
  }
}

function drawDividers() {
  const brighten = 0.08;
  g.setColor(bgColor[0] + brighten, bgColor[1] + brighten, bgColor[2] + brighten);
  g.fillRect(0, yposDate - 12, g.getWidth(), yposDate - 12 + 1); 
}

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (on) redraw();
});

// clean app screen
g.clear();
Bangle.loadWidgets();
g.setColor(bgColor[0], bgColor[1], bgColor[2]);
g.fillRect(0, 25, g.getWidth(), g.getHeight());
Bangle.drawWidgets();

// refesh every 100 milliseconds
setInterval(redraw, 1000);

// draw now
redraw();
drawHR();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

var clickTimes = [];
setWatch(function(e) {
  while (clickTimes.length >= HR_CLICK_COUNT) {
    clickTimes.shift();
  }
  clickTimes.push(e.time);
  var clickPeriod = e.time-clickTimes[0];
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

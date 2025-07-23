let currentDate = new Date();
// This price pattern returns true for a second decimal place, not sure the fix
const pricePattern = /^\.?\d+(?:[.,]\d+)*$/;
const datePattern = /^(3[01]|[12][0-9]|0?[1-9])\/(1[0-2]|0?[1-9])(\/(?:[0-9]{2})?[0-9]{2})?$/
const form = document.querySelector('.dates');
const radios = document.getElementsByName('chargeType');
const list = document.querySelector('.rates');
const clock = document.querySelector('.clock');
const date = document.querySelector('.date');

radios.forEach(e => {
  e.addEventListener("click", function() {
    removeElements();
    printToDOM();
  });
});

form.addEventListener('keyup', e => {
  validation();
  removeElements();
  printToDOM();
});

const validation = () => {
  if(event.target.name === 'price') {
    if(!pricePattern.test(event.target.value)  ){
      form.price.classList.add('error');
      form.price.classList.remove('success');
    }
    else {
      form.price.classList.add('success');
      form.price.classList.remove('error');
    }
  }
  if(event.target.name === 'start' || event.target.name === 'end'){
    if(!datePattern.test(event.target.value)){
      event.target.classList.add('error')
      event.target.classList.remove('success')
    }
    else {
      event.target.classList.add('success')
      event.target.classList.remove('error')
    }
  }
}

const printToDOM = () => {
  let startDate = formatDate(form.start.value);
  let endDate = formatDate(form.end.value);
  let quantity = qtyCheck();
  let price = form.price.value * quantity
  let delivery = priceCheck(form.delivery.value);
  let collection = priceCheck(form.collection.value);

  if(startDate <= endDate && dayCount(startDate, endDate) <=60 && datePattern.test(form.start.value) && datePattern.test(form.end.value)) {
    let fullArray = weArray(startDate, endDate);
    let modArray = fullArray.map((item) => {
      if(item["Index"] === 0 && fullArray.length === 1) {
        return{["Index"]: item["Index"], ["Week Ending Date"]: item["Week Ending Date"], ["Week Days"]: item["Week Days"], ["Weekend"]: item["Weekend"], ["Delivery"]: delivery, ["Collection"]: collection, ["5 Day Total"]: (price/5)*item["Week Days"], ["7 Day Total"]: (price/7)*(item["Week Days"] + item["Weekend"])}
      }
      else if(item["Index"] === 0) {
          return{["Index"]: item["Index"], ["Week Ending Date"]: item["Week Ending Date"], ["Week Days"]: item["Week Days"], ["Weekend"]: item["Weekend"], ["Delivery"]: delivery, ["Collection"]: 0, ["5 Day Total"]: (price/5)*item["Week Days"], ["7 Day Total"]: (price/7)*(item["Week Days"] + item["Weekend"])}
      }
      else if(item["Index"] === fullArray.length -1) {
        return{["Index"]: item["Index"], ["Week Ending Date"]: item["Week Ending Date"], ["Week Days"]: item["Week Days"], ["Weekend"]: item["Weekend"], ["Delivery"]: 0, ["Collection"]: collection, ["5 Day Total"]: (price/5)*item["Week Days"], ["7 Day Total"]: (price/7)*(item["Week Days"] + item["Weekend"])}
      }
      else {
        return {["Index"]: item["Index"], ["Week Ending Date"]: item["Week Ending Date"], ["Week Days"]: item["Week Days"], ["Weekend"]: item["Weekend"], ["Delivery"]: 0, ["Collection"]: 0, ["5 Day Total"]: (price/5)*item["Week Days"], ["7 Day Total"]: (price/7)*(item["Week Days"] + item["Weekend"])}
      }
    })

    for(let i=0; i< fullArray.length; i++) {
      generateTemplate(modArray[i]["Week Ending Date"], price, modArray[i]["Week Days"], modArray[i]["Weekend"], modArray[i]["Delivery"], modArray[i]["Collection"]);
    }
    generateTotalTemplate(modArray);
    console.log(fullArray);
    console.log(modArray);
  }
}




const removeElements = () => {
  let elements = document.getElementsByClassName('weDate');
  if (elements !== null) {
    while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
    }
  }
}

const formatDate = date => {
  // user enters date & convert date to GB format
  // also if no year entered set to current year
  let dateParts = date.split('/');

  if(typeof dateParts[2] === 'undefined') {
    dateParts[2] = currentDate.getFullYear();
  }
  else if (dateParts[2].length === 2){
    dateParts[2] = parseInt(dateParts[2]) + 2000;
  }
  let formatedDate = new Date(dateParts[2], dateParts[1] -1, dateParts[0]);
  return formatedDate;
}

// Generate array based on user input with week ending date, weekday count and weekend count for each week
const weArray = (fromDate, toDate) => {
  let datesArray = [];
  // Checking if a Sunday exists in the date range.  If it doesn't generate the array using the shortWeekCount function
  if(checkSunday(fromDate, toDate) === 0){
    datesArray.push(shortWeekCount(fromDate, toDate, getWeekendDate(fromDate, toDate)));
  }
  else {
    datesArray = longWeekCount(fromDate, toDate);
  }
  return datesArray;
}

const shortWeekCount = (from, to, we) => {
  let weekdays = 0;
  let weekendDays = 0;
  let i = 0;
  while(from <= to){
    if(from.getDay()< 6) {
      weekdays++;
    }
    else{
      weekendDays++;
    }
    from.setDate(from.getDate() + 1);
  }
  return pushObject(we, weekdays, weekendDays, i);
}

const longWeekCount = (from, to) => {
  let weekdays = 0;
  let weekendDays = 0;
  let dates = [];
  let i = 0;

  while(from <= to){

    if(from.getDay() > 0 && from.getDay()< 6) {
      weekdays++;
    }
    else if(from.getDay() === 6){
      weekendDays++;
    }
    else {
      weekendDays++;
      dates.push(pushObject(from, weekdays, weekendDays, i));
      i++;
      weekdays = 0;
      weekendDays = 0;
    }

    from.setDate(from.getDate() + 1);
  }

  // if the to date isn't a Sunday (common) this needs to run to calculate the next week ending date and the number of chargeable days
  if(to.getDay() !== 0){
    weekdays = 0;
    weekendDays = 0;

    let finalWeek = new Date(dates[dates.length - 1]['Week Ending Date']);
    finalWeek.setDate(finalWeek.getDate() + 7);

    let lastWeekStart = new Date(dates[dates.length - 1]['Week Ending Date']);
    lastWeekStart.setDate(lastWeekStart.getDate() + 1);

    while(lastWeekStart <= to){
      if(lastWeekStart.getDay() > 0 && lastWeekStart.getDay()< 6) {
        weekdays++;
      }
      else if(lastWeekStart.getDay() === 6){
        weekendDays++;
      }
      lastWeekStart.setDate(lastWeekStart.getDate() + 1);
    };
    dates.push(pushObject(finalWeek, weekdays, weekendDays, i));
  }


  return dates;
}

const pushObject = (we, weekday, weekend, index) => {
  let obj = {};
  obj["Week Ending Date"] = new Date(we);
  obj["Week Days"] = weekday;
  obj["Weekend"] = weekend;
  obj["Index"] = index;
  return obj;
}

const dayCount = (from, to) => {
  return Math.round((to-from)/(1000*60*60*24)) + 1;
}

const checkSunday = (from, to) => {
  let result = 0;
  let startDate = new Date(from);
  while(startDate <= to) {
    if(startDate.getDay() === 0) {
      result = 1;
      return result;
      break;
    }
    startDate.setDate(startDate.getDate() + 1)
  }
  return result;
}

const getWeekendDate = (from, to) => {
  let weekendDate = new Date(from);
  while(weekendDate.getDay() > 0) {
    weekendDate.setDate(weekendDate.getDate() + 1);
  }
  return weekendDate;
}

const generateTemplate = (date, price, weekdays, weekendDays, del, col) => {
  let chargeType;
  let chargeableDays;
  let rate;

  if(!pricePattern.test(price))
  {
    price = parseFloat(0.00).toFixed(2);
  }

  document.getElementsByName('chargeType')
  .forEach(radio => {
    if(radio.checked) {
      chargeType = radio.value;
    }
  })
  if (chargeType === '5day') {
    chargeableDays = weekdays
    rate = 5
  }
  else {
    chargeableDays = weekdays + weekendDays
    rate = 7
  }

  const html = `
  <li class="list-group-item d-flex justify-content-between align-items-center weDate">
  <span>Week Ending <strong>${dateFns.format(date, 'dddd Do MMMM YYYY')}</strong></span>
  <!-- <span><strong>(${outputDateFormat(date)})</strong></span> -->
  <span><strong>£${((del + col) + (price/rate) * chargeableDays).toFixed(2)}</strong><span>
  </li>
  `;

  list.innerHTML += html;
}

const generateTotalTemplate = finalArray => {

  let chargeType;
  let total;

  const fiveDayTotal = finalArray.reduce((acc, item) => {
        acc += item["5 Day Total"];
      return acc;
  }, 0);

  const sevenDayTotal = finalArray.reduce((acc, item) => {
        acc += item["7 Day Total"];
      return acc;
  }, 0);

  const deliveryTotal = finalArray.reduce((acc, item) => {
        acc += item["Delivery"];
      return acc;
  }, 0);

  const collectionTotal = finalArray.reduce((acc, item) => {
        acc += item["Collection"];
      return acc;
  }, 0);

  document.getElementsByName('chargeType')
  .forEach(radio => {
    if(radio.checked) {
      chargeType = radio.value;
    }
  })
  if (chargeType === '5day') {
    total = fiveDayTotal + deliveryTotal + collectionTotal
  }
  else {
    total = sevenDayTotal + deliveryTotal + collectionTotal
  }

  list.innerHTML += `
  <li  style = "background: rgba(0,0,0,0.5);" class="list-group-item d-flex justify-content-between align-items-center weDate">
  <span>Total</span>
  <span><strong>£${total.toFixed(2)}</strong><span>
  </li>
  `
}

const outputDateFormat = date => {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  if(month <= 9) {
    month = '0'+ month;
  }
  if(day <= 9) {
    day = '0'+day;
  }
  return day + "/" + month;
}

const setDefaults = () => {
let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
let endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
form.start.value = outputDateFormat(startOfMonth)
form.end.value = outputDateFormat(endOfMonth)
}

const qtyCheck = () => {
  let howMany = 1;
  if (/^.*[\d].*$/.test(form.quantity.value)) {
      howMany = Math.floor(form.quantity.value)
  }
  return howMany;
}

const priceCheck = (priceValue) => {
  if (pricePattern.test(priceValue)) {
      priceValue = parseFloat(priceValue)
  }
  else {
    priceValue = 0;
  }
  return priceValue;
}

const tick = () => {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds()

  if (h < 10) {
    h = `0${h}`
  }

  if (m < 10) {
    m = `0${m}`
  }

  if(s < 10) {
    s = `0${s}`
  }

    const html = `
    <span>${h}</span> :
    <span>${m}</span> :
    <span>${s}</span>
  `;
  clock.innerHTML = html;

  const html2 = `
  <span>${dateFns.format(currentDate, 'dddd Do MMMM YYYY')}</span>
  `;
  date.innerHTML = html2;
};



setInterval(tick, 1000);

setDefaults();






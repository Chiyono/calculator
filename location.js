const locationForm = document.querySelector('.city');
const area = document.querySelector('.location');
const tempSection = document.querySelector('.temp');
const locationLabel = document.querySelector('.city input');
const buttonSection = document.querySelector('.button-container');
let t = 0; // time counter
let r = 0; // reset counter
let x = 0; // event handler counter

const nextButton = document.querySelector('.next');
const backButton = document.querySelector('.back');
const refreshButton = document.querySelector('.refresh');
const deleteButton = document.querySelector('.delete');

const printDetails = data => {
  const formatLocalTime = (date) => {
    let localTime = new Date(date);
    localTime.setHours(localTime.getHours() + data.details.TimeZone.GmtOffset - 1);
    return(dateFns.format(localTime, 'HH:mm'));
  }
  const timeHTML = `
  <div class="px-1">
  <h5>${formatLocalTime(data.weather[t].DateTime)}</h5>
  <div><img src="img/icons/${data.weather[t].WeatherIcon}.svg" class="filter-white"></div>
  <div>${Math.round(((data.weather[t].Temperature.Value - 32)*(5/9))*10)/10}&deg;C</div>
  <div>${data.weather[t].IconPhrase}</div>
  </div>
  <div class="px-1">
  <h5>${formatLocalTime(data.weather[t+2].DateTime)}</h5>
  <div><img src="img/icons/${data.weather[t+2].WeatherIcon}.svg" class="filter-white"></div>
  <div>${Math.round(((data.weather[t+2].Temperature.Value - 32)*(5/9))*10)/10}&deg;C</div>
  <div>${data.weather[t+2].IconPhrase}</div>
  </div>
  <div class="px-1">
  <h5>${formatLocalTime(data.weather[t+4].DateTime)}</h5>
  <div><img src="img/icons/${data.weather[t+4].WeatherIcon}.svg" class="filter-white"></div>
  <div>${Math.round(((data.weather[t+4].Temperature.Value - 32)*(5/9))*10)/10}&deg;C</div>
  <div>${data.weather[t+4].IconPhrase}</div>
  `

  area.innerHTML = `${data.details.LocalizedName} - ${data.details.Country.LocalizedName}`
  tempSection.innerHTML = timeHTML;
  buttonSection.classList.add('mt-4');
  buttonSection.classList.remove('hidden');
  locationLabel.setAttribute('placeholder', "Change Location");
}

const updateLocation = async (city) => {
  const details = await getCity(city);
  // const weather = await getWeather(details.Key);
  const weather = await hourWeather(details.Key);


  return {
    details,
    weather
  }
}

locationForm.addEventListener('submit', e => {
  e.preventDefault();
  t=0;

  const location = locationForm.city.value.trim();
  locationForm.reset();

  updateLocation(location).then(data => {

    printDetails(data);

    nextButton.addEventListener('click', () => {
      if(t<6){
        x+=1;
        t+=2;
      }
      printDetails(data);
      console.log('forward button clicked...','\n','value of array selector :',t,'\n','value of event handler counter:', x);
    });

    backButton.addEventListener('click', e=> {
      if (t>1) {
        t-=2;
        x-=1;
        printDetails(data);
      }
    });

    refreshButton.addEventListener('click', e=> {
      console.log('refreshed', data);
      t=0;
      updateLocation(location).then(data => {

        printDetails(data);

    })
    .catch(err => console.log(err));
  });

  deleteButton.addEventListener('click', e=> {
    t = 0;
      buttonSection.classList.add('hidden');
      locationLabel.setAttribute('placeholder', "Enter Location");
      area.innerHTML = `Weather Check`
      tempSection.innerHTML = ``;
  })



  })
  .catch(err => console.log(err));

});

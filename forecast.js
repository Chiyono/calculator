const key ='AIN7aoUYgYFSB70WibafxLrwTAIhkIQa';


// get city information
const getCity = async (city) => {

  const base = 'http://dataservice.accuweather.com/locations/v1/cities/search'
  const query = `?apikey=${key}&q=${city}`;

  const response = await fetch(base + query);
  const data = await response.json();
  // console.log(data[0]);
  let i = 0;
  while(i < data.length && data[i].Country.EnglishName !== "United Kingdom"){
    console.log(data[i].Country.EnglishName);
    i++;
  }

  if(i >= data.length) {
    i--;
  }
  if (data[i].Country.EnglishName == "United Kingdom") {
  return data[i] }
  else {
    return data[0]
  }

}

// get weather information
const getWeather = async (id) => {

  const base = 'http://dataservice.accuweather.com/currentconditions/v1/'
  const query = `${id}?apikey=${key}`;

  const response = await fetch(base + query);
  const data = await response.json();

  return data[0];

}

const hourWeather = async (id) => {

  const base ='http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/'
  const query = `${id}?apikey=${key}`;

  const response = await fetch(base + query);
  const data = await response.json();

  return data;
}

// getCity('Lossiemouth').then(data => {
//     return getWeather(data.Key);
//   }).then(data => {
//     console.log(data);
//   })
//   .catch(err => console.log(err));

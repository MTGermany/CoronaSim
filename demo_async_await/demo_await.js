// does not work
// https://www.carlrippon.com/fetch-with-async-await-and-typescript/
/*
async function http(request) {
  const response = await fetch(request);
  const body = await response.json();
  return body;
}

// example consuming code
const data = async http(
  "https://jsonplaceholder.typicode.com/todos"
);
*/



// does not work as well -> forget it at the moment
// https://dev.to/johnpaulada/synchronous-fetch-with-asyncawait

const request = async () => {
  const response = await fetch("https://pomber.github.io/covid19/timeseries.json");
  console.log("response=",response);
    const json = await response.json();
    console.log(json);
}

const demo = async function(){
  const res = await request()
}

demo();


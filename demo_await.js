function http(request){
  const response = await fetch(request);
  const body = await response.json();
  return body;
}

// example consuming code

function demo(){
  const data = await http(
    "https://pomber.github.io/covid19/timeseries.json"
  );
  console.log("data=",data);
}

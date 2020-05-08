
async function http(
  request: RequestInfo
): Promise<any> {
  const response = await fetch(request);
  const body = await response.json();
  return body;
}

// example consuming code
const data = await http(
  "https://jsonplaceholder.typicode.com/todos"
);
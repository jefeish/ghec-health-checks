const validJSON = '["a","b","c"]';

try {
  const parsedData = JSON.parse(validJSON);
  console.log(parsedData);
} catch (error) {
  console.error('Error parsing JSON:', error);
}

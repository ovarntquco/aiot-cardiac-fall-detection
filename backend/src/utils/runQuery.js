export default async function runQuery(queryPromise) {
  const { data, error } = await queryPromise;
  
  if (error) {
    const err = new Error(error.message);
    err.code = error.code;
    err.details = error.details;
    throw err;
  }
  
  return data;
}
const app = require("./app.js");

// no need to call dotenv config since app.js calls it already
// in short we can access env vars
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Waldo API listening on port ${PORT}!`));

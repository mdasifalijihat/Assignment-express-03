import app from "./app";
import config from "./config/env";

const port = config.port;
// port listen
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

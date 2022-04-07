# LWR C360 Broken Example

This LWR example contains the minimum code needed to show the error importing [C360 Button](https://c360-subsystem-storybook.herokuapp.com/?path=/docs/c360-subsystem-components-button--base).

## Project Setup

The directory structure looks like this:

```bash
scripts/
  └── start-server.mjs                  # create and start server
src/
  ├── assets/                           # static assets
  │   └── css/
          ├── hooks.custom-props.css    # (C360 hooks, copied during `postinstall`)
  │       └── main.css
  └── modules/                          # site pages
  │   └── home
  │       └── app
              ├── app.css
              ├── app.html
              └── app.js
  └── layouts/                          # site page layouts
      └── main_layout.njk
lwr.config.json                         # lwr configuration
package.json                            # npm packaging configuration
```

## Running the Project

```bash
yarn 
yarn dev
```

Open the site at [http://localhost:3000](http://localhost:3000)

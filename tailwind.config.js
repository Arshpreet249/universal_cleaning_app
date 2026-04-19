/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}',
     './components/**/*.{js,ts,tsx}',
     './screens/**/*.{js,ts,tsx}'
    ],

  presets: [require('nativewind/preset')],
  theme: {
       extend: {
      colors: {
        primary: "#0564BF",
        secondary:"#25B7FD",
        dark:"#444B54",
      }

    },
  },
  plugins: [],
};

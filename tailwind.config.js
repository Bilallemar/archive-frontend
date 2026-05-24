/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        headerColor: "#ffffff",
        textColor: "#000000",
        btnColor: "#0172F4",
        noteColor: "#FFCF7C",
        menuColor: "#eff8f4",
        darkGreen: "#eff8f4",
        lightGreen: "#41c460",
        blackColor: "#000000",
      },
      fontWeight: {
        customWeight: 500,
      },
      height: {
        headerHeight: "74px",
      },
      maxHeight: {
        navbarHeight: "420px",
      },
      minHeight: {
        customHeight: "530px",
      },
      fontFamily: {
        montserrat: ["Montserrat"],
        dancingScript: ["Dancing Script"],
      },
      fontSize: {
        logoText: "30px",
        customText: "15px",
        tablehHeaderText: "16px",
        headerText: ["50px", "60px"],
        tableHeader: ["15px", "25px"],
      },

      backgroundColor: {
        customRed: "#9fa4a8",
        testimonialCard: "#F9F9F9",
      },
      boxShadow: {
        custom: "0 0 15px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

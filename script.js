// For toggle menu in mobile view as well as overlay
const menuBtn = document.querySelector(".menu-btn");
const overlay = document.querySelector(".overlay");
const hideElems = document.querySelectorAll(".has-fade");
let menuOpen = false;
menuBtn.addEventListener("click", () => {
  if (!menuOpen) {
    menuBtn.classList.add("open");
    hideElems.forEach(function (element) {
      element.classList.remove("fade-out");
      element.classList.add("fade-in");
    });
    menuOpen = true;
  } else {
    menuBtn.classList.remove("open");
    hideElems.forEach(function (element) {
      element.classList.remove("fade-in");
      element.classList.add("fade-out");
    });
    menuOpen = false;
  }
});

/**
 * Helper function for POSTing data as JSON with fetch.
 *
 * @param {Object} options
 * @param {string} options.url - URL to POST data to
 * @param {FormData} options.formData - `FormData` instance
 * @return {Object} - Response body from URL that was POSTed to
 */
async function postFormDataAsJson({ url, formData }) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    },
    body: formDataJsonString
  };

  const response = await fetch(url, fetchOptions);
  let data = {};
  let error = {};

  if (!response.ok) {
    error = await response.json();
  } else {
    data = await response.json();
  }
  return [data, error];
}

async function postFormDataAsMultipart({ url, formData, enctype }) {
  const fetchOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    },
    body: formData
  };

  const response = await fetch(url, fetchOptions);
  let data = {};
  let error = {};

  if (response.status === 401) {
    alert("Login required");
    document.location = "login.html";
  } else {
    if (!response.ok) {
      error = await response.json();
    } else {
      data = await response.json();
    }
    return [data, error];
  }
}
/**
 * Event handler for a form submit event.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 *
 * @param {SubmitEvent} event
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const url = form.action;
  const enctype = form.enctype;
  console.log(enctype);

  try {
    const formData = new FormData(form);
    const response = await postFormDataAsJson({ url, formData });
    let responseData = response[0];
    let responseError = response[1];

    if (Object.keys(responseError).length) {
      alert(`Error ${responseError.status}: ${responseError.message}`);
      console.error(responseError);
    } else if (Object.keys(responseData).length) {
      if (signUpPage) {
        console.log(JSON.stringify(responseData, null, 2));
        try {
          sessionStorage.setItem("authToken", responseData.data.token);
        } catch (error) {
          console.error(error);
        }

        document.location = "home.html";
      }
      if (loginPage) {
        try {
          sessionStorage.setItem("authToken", responseData.data.token);
        } catch (error) {
          console.error(error);
        }

        document.location = "home.html";
      }
    }
  } catch (error) {
    console.error(error);
    alert("An error occurred.");
  }
}

async function bannerFormSubmit(event) {
  event.preventDefault();

  if (!sessionStorage.getItem("authToken")) {
    alert("You need to log in first");
    document.location = "login.html";
  } else {
    const form = event.currentTarget;
    const url = form.action;
    const enctype = form.enctype;

    try {
      const formData = new FormData(form);
      const response = await postFormDataAsMultipart({
        url,
        formData,
        enctype
      });
      if (!response) {
        return;
      } else {
        let responseData = response[0];
        let responseError = response[1];

        if (Object.keys(responseError).length) {
          alert(`Error ${responseError.status}: ${responseError.message}`);
          console.error(responseError);
        } else if (Object.keys(responseData).length) {
          document.location = "location.html";
        } else {
          alert("Submitted");
        }
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  }
}

const signUpPage = document.getElementById("registerForm");
if (signUpPage) {
  signUpPage.addEventListener("submit", handleFormSubmit);
}

const loginPage = document.getElementById("loginForm");
if (loginPage) {
  loginPage.addEventListener("submit", handleFormSubmit);
}

// Logout section
const logoutFunc = (event) => {
  event.preventDefault();
  sessionStorage.removeItem("authToken");
  document.location = "index.html";
};

const logoutButtons = document.getElementsByClassName("logout");
if (logoutButtons) {
  for (let i = 0; i < logoutButtons.length; i++) {
    logoutButtons[i].addEventListener("click", logoutFunc);
  }
}

const bannerCreatePage = document.getElementById("bannerCreateForm");
if (bannerCreatePage) {
  bannerCreatePage.addEventListener("submit", bannerFormSubmit);
}

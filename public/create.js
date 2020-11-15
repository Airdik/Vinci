// Getting html elements by id
const fname = document.getElementById('fname');
const lname = document.getElementById('lname');
const email = document.getElementById('email');
const username = document.getElementById('username');
const password = document.getElementById('password');
const vpassword = document.getElementById('vpassword');
const submitBtn = document.getElementById('submitBtn');

//Errors text
const fnameError = document.getElementById('fnameError');
const lnameError = document.getElementById('lnameError');
const emailError = document.getElementById('emailError');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const vpasswordError = document.getElementById('vpasswordError');
const submitError = document.getElementById('submitError');

// Patterns
const name_pattern = /^[a-z'-]{3,}$/i;
const username_pattern = /^[a-zA-Z]{4,}$/i;
const email_pattern = /\w+@\w{2,}\.\w{2,}/i;
const phone_pattern = /^(\d{1}?)?\(?\d{3}\)?[ ]?-?\d{3}-?\d{4}$/;
const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*[-_=+|\\].*).{8,}$/;

// Storing valid input from form
_fname = "";
_lname = "";
_username = "";
_email = "";
_password = "";

let no_errors = true;

const validate = evt => {
    no_errors = true;

    switch (evt.target.id) {

        case 'fname':
            if (!name_pattern.test(fname.value)) {
                fnameError.innerHTML = "Invalid First Name";
                no_errors = false;
                return;
            } else {
                fnameError.innerHTML = "&nbsp";
            }
            break;

        case 'lname':
            if (!name_pattern.test(lname.value)) {
                lnameError.innerHTML = "Invalid Last Name";
                no_errors = false;
                return;
            } else {
                lnameError.innerHTML = "&nbsp";
            }
            break;

        case 'email':
            if (!email_pattern.test(email.value)) {
                emailError.innerHTML = "Email Is Not Valid";
                no_errors = false;
                return;
            } else {
                emailError.innerHTML = "&nbsp";
            }
            break;

        case 'username':
            if (!username_pattern.test(username.value)) {
                usernameError.innerHTML = "Username Is Not Valid";
                no_errors = false;
                return;
            } else {
                usernameError.innerHTML = "&nbsp";
            }
            break;

        case 'password':
            if (!password_pattern.test(password.value)) {
                passwordError.innerHTML = "Requirements Not Satisfied";
                no_errors = false;
                return;
            } else {
                passwordError.innerHTML = "&nbsp";
            }
            break;

        case 'vpassword':
            if (password_pattern.test(password.value)) {
                let vpassword_pattern = new RegExp(password.value)
                if (!vpassword_pattern.test(vpassword.value)) {
                    vpasswordError.innerHTML = "Password Not Matching";
                    no_errors = false;
                    return;
                } else {
                    vpasswordError.innerHTML = "&nbsp";
                }
            }
            break;

        default: // Executes when the submit button is clicked

            //Final Check before submit
            if (name_pattern.test(fname.value)
                && name_pattern.test(lname.value)
                && email_pattern.test(email.value)
                && username_pattern.test(username.value)
                && password_pattern.test(password.value)
                && vpassword.value == password.value) {
                console.log("Form is clean.")
                //Storing data
                _fname = fname.value;
                _lname = lname.value;
                _username = username.value;
                _email = email.value;
                _password = password.value;

                //Returning true
                no_errors = true;
                saveUserToDatabase();
                return no_errors;
            } else {
                no_errors = false;
                console.log("You have Errors.")
                submitError.innerHTML = "Form Is Not Valid"
                setTimeout(() => { submitError.innerHTML = "&nbsp;" }, 2500);

                // Incase password
                if (vpassword.value == password.value) {
                    vpasswordError.innerHTML = "&nbsp;"
                } else {
                    vpasswordError.innerHTML = "Password Not Matching"
                }

                //Returning false
                return no_errors;
                
            }
            
    }
 
};



// Saving new user information to the database here.
const saveUserToDatabase = () => {

    // Send the values in the console logs to the database instead
    console.log("fname", _fname);
    console.log("lname", _lname);
    console.log("username", _username);
    console.log("email", _email);
    console.log("password", _password);

}


fname.addEventListener('input', validate);
lname.addEventListener('input', validate);
email.addEventListener('input', validate);
username.addEventListener('input', validate);
password.addEventListener('input', validate);
vpassword.addEventListener('input', validate);

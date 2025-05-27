import * as Yup from "yup";
import { PHASES } from "../configs/dataroomConfig";

// email
const EMAIL_PATTERN =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// password
const PASSWORD_PATTERN =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// phone
const PHONE_PATTERN =
    /^(((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?|)$/;

const PASSWORD_REQUIREMENTS = [
    "Password must be at least 8 characters",
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
];

const validatePhone = (phone) => {
    return PHONE_PATTERN.test(phone);
};

const validateEmail = (email) => {
    return EMAIL_PATTERN.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8 && PASSWORD_PATTERN.test(password);
};

/**********************************************************/
/************************* Yup Schema *********************/
/**********************************************************/

/********* Common Schemas *********/
const dateYupSchema = Yup.date().typeError("Invalid Date");

/********** User Schemas  *********/
const firstnameYupSchema = Yup.string().max(50, "First name is too long");

const lastnameYupSchema = Yup.string().max(50, "Last name is too long");

const phoneYupSchema = Yup.string().matches(
    PHONE_PATTERN,
    "Invalid phone number. Please only include numbers and dashes."
);
const titleYupSchema = Yup.string().max(50, "Title is too long");

const organizationYupSchema = Yup.string().max(
    50,
    "Organization name is too long"
);

const passwordYupSchema = Yup.string()
    .min(8, PASSWORD_REQUIREMENTS[0])
    .matches(PASSWORD_PATTERN, PASSWORD_REQUIREMENTS[1]);

const confirmPasswordYupSchema = Yup.string().oneOf(
    [Yup.ref("password"), null],
    "Passwords must match"
);

const emailYupSchema = Yup.string().matches(
    EMAIL_PATTERN,
    "Invalid email address"
);

/********** Dataroom Schemas *********/
const dataroomNameYupSchema = Yup.string().max(50, "Dataroom name is too long");

const dataroomDescriptionYupSchema = Yup.string().max(
    500,
    "Dataroom description is too long"
);

const dataroomOrganizationYupSchema = Yup.string().max(
    50,
    "Organization name is too long"
);

const dataroomPhaseYupSchema = Yup.string().oneOf(PHASES, "Invalid phase");

const dataroomStorageYupSchema = Yup.number()
    .typeError("Storage size must be a number")
    .min(0, "Storage size cannot be negative");

/********** Contract Schemas *********/
const contractIdYupSchema = Yup.string().max(50, "Contract name is too long");

const contractDescriptionYupSchema = Yup.string().max(
    500,
    "Contract description is too long"
);

const contractOrganizationYupSchema = Yup.string().max(
    100,
    "Organization name is too long"
);

const contractMaxStorageYupSchema = Yup.number()
    .typeError("Storage size must be a number")
    .min(0, "Storage size cannot be negative");

const contractMaxDataroomsYupSchema = Yup.number()
    .typeError("Max datarooms must be a number")
    .min(0, "Max datarooms cannot be negative");

const contractStatusYupSchema = Yup.string().oneOf(
    ["Inactive", "Active"],
    "Invalid status"
);

export {
    EMAIL_PATTERN,
    PASSWORD_PATTERN,
    validateEmail,
    validatePassword,
    validatePhone,
    PASSWORD_REQUIREMENTS,
    passwordYupSchema,
    confirmPasswordYupSchema,
    emailYupSchema,
    firstnameYupSchema,
    lastnameYupSchema,
    phoneYupSchema,
    titleYupSchema,
    dateYupSchema,
    organizationYupSchema,
    dataroomNameYupSchema,
    dataroomDescriptionYupSchema,
    dataroomOrganizationYupSchema,
    dataroomPhaseYupSchema,
    dataroomStorageYupSchema,
    contractIdYupSchema,
    contractDescriptionYupSchema,
    contractOrganizationYupSchema,
    contractMaxStorageYupSchema,
    contractMaxDataroomsYupSchema,
    contractStatusYupSchema,
};

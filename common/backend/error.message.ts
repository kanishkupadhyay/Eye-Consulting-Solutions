class ResultErrorMessage {
  public static readonly PhoneNumberIsInvalid = "Phone number is invalid";
  public static readonly EmailIsRequired = "Email is required";
  public static readonly PasswordIsRequired = "Password is required"
  public static readonly PasswordMustBeAtLeast8Characters = "Password must be at least 8 characters";
  public static readonly FirstNameIsRequired = "First name is required";
  public static readonly CountryCodeIsRequired = "Country code is required";
  public static readonly PhoneNumberIsRequired = "Phone number is required";
  public static readonly EmailIsNotValid = "Email is not valid";
  public static readonly UserAlreadyExistsWithThisEmail = "User already exists with this email";
  public static readonly CountryCodeDoesNotExist = "Country code does not exist";
  public static readonly InvalidCredentials = "Invalid credentials";
  public static readonly PhoneNumberAlreadyInUse = "Phone number already in use";
  public static readonly YouAreNotAuthorized = "You are not authorized";
  public static readonly YouDontHavePermissionToPerformThisAction = "You don't have permission to perform this action";
  public static readonly UserIdIsRequired = "User ID is required";
  public static readonly UserNotFound = "User not found";
  public static readonly AccessDenied = "Access denied";
  public static readonly OtpIsRequired = 'OTP is required';
  public static readonly InvalidOrExpiredToken = 'Invalid OTP or token has expired';
  public static readonly NewPasswordIsRequired = 'New password is required';
  public static readonly ResetTokenIsRequired = 'Reset token is required';

  // Candidate related error messages
  public static readonly NoResumeFilesProvided = "No resume files were provided.";
  public static readonly NameIsRequired = "Name is required";
  public static readonly AgeIsInvalid = "Age must be between 18 and 65";
  public static readonly GenderIsInvalid = "Gender is invalid";
  public static readonly StateIsRequired = "State is required";
  public static readonly CityIsRequired = "City is required";
  public static readonly InvalidState = "Invalid state";
  public static readonly InvalidCity = "Invalid city";
  public static readonly ExperienceYearsCannotBeNegative = "Experience years cannot be negative";
  public static readonly ExperienceYearsCannotExceed50 = "Experience years cannot exceed 50";
  public static readonly ExperienceMonthsCannotBeNegative = "Experience months cannot be negative";
  public static readonly ExperienceMonthsCannotExceed11 = "Experience months cannot exceed 11";
  public static readonly AtLeastOneSkillIsRequired = "At least one skill is required";
  public static readonly CandidateNotFound = "Candidate not found";
  public static readonly InvalidEducationFormat = "Invalid education format";
  public static readonly InvalidExperienceFormat = "Invalid experience format";
  public static readonly OnlyOneJobCanBeMarkedAsCurrentlyWorking = "Only one job can be marked as currently working";
  public static readonly CandidateAlreadyExistsWithThisEmail = "Candidate already exists with this email";
  public static readonly CandidateAlreadyExistsWithThisPhoneNumber = "Candidate already exists with this phone number";
  public static readonly DuplicateEmailInBatch = "Duplicate email found among candidates";
  public static readonly DuplicatePhoneInBatch = "Duplicate phone number found among candidates";
  public static readonly NoCandidatesProvided = "No candidates provided";
}

export default ResultErrorMessage;

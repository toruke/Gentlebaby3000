export function verificationPassword(password: string) {
  const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  return passwordRegex.test(password);
}

export function verificationEmail(email: string) {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
}
import { TFunction } from "next-i18next";

import { buildMessageTemplate, VarType } from "../../emails/buildMessageTemplate";

export const forgotPasswordSubjectTemplate = (t: TFunction): string => {
  const text = t("forgot_your_password_calcom");
  return text;
};

export const forgotPasswordMessageTemplate = (t: TFunction): string => {
  const text = `Dear User,

  We received a request for a password change on your Hibox Schedular account. You can reset your password using below link.
  {{link}}
  
  This link will expire in 6 hours. After that you need to submit a new request in order to reset your password. If you don't want to reset it, simply disregard this email.
  
  Best, \n Hibox Team`;
  return text;
};

export const buildForgotPasswordMessage = (vars: VarType) => {
  return buildMessageTemplate({
    subjectTemplate: forgotPasswordSubjectTemplate(vars.language),
    messageTemplate: forgotPasswordMessageTemplate(vars.language),
    vars,
  });
};

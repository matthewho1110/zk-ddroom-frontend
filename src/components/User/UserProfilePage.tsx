import styled from "@emotion/styled";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { isEqual } from "lodash";
import type { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";
import useUserProfileQuery from "../../hooks/useUserProfile";
import {
  emailYupSchema,
  firstnameYupSchema,
  lastnameYupSchema,
  organizationYupSchema,
  phoneYupSchema,
  titleYupSchema,
} from "../../utils/inputValidator";
import ZKTextField from "../ZKForm/ZKTextField";
import "react-phone-number-input/style.css";
// "With country select" component.
import { isPossiblePhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";

import lange from "@i18n";

export interface UserType {
  uid: string;
  firstname: string;
  lastname: string;
  email: string;
  organization: string;
  type: string;
}

const RegistrationInput = styled(TextField)({
  "& .MuiInputBase-input": {
    padding: "1rem",
  },
  marginBottom: "0.5rem",
});

type UserProfilePageProps = {};

const updateUserSchema = yup.object().shape({
  email: emailYupSchema,
  firstname: firstnameYupSchema,
  lastname: lastnameYupSchema,
  organization: organizationYupSchema,
  title: titleYupSchema,
  phone: phoneYupSchema,
});
type UserSchema = yup.InferType<typeof updateUserSchema>;

const UserProfilePage: FC<UserProfilePageProps> = () => {
  const { axiosInstance } = useUser();
  const { setAlert } = useAlert();

  const queryClient = useQueryClient();

  const { data, isLoading } = useUserProfileQuery();

  let { email, firstname, lastname, organization, title, phone } = data || {};

  // Mutations
  const mutation = useMutation<null, void, UserSchema>({
    mutationFn: (payload) =>
      (axiosInstance as unknown as AxiosInstance).put(
        `user/updateProfile`,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user/profile"] });
      // @ts-ignore
      setAlert("User profile updated successfully", "success");
    },
  });

  const { control, watch, reset, handleSubmit } = useForm<UserSchema>({
    resolver: yupResolver(updateUserSchema),
    values: {
      email: data?.email,
      firstname: data?.firstname,
      lastname: data?.lastname,
      organization: data?.organization,
      title: data?.title,
      phone: data?.phone,
    },
  });

  const isSame = isEqual(
    {
      email,
      firstname,
      lastname,
      organization,
      title,
      phone,
    },
    watch()
  );

  const onSubmit = handleSubmit((formValue) => {
    // * since email is not allowed to change
    delete formValue.email;
    // * call API
    mutation.mutate(formValue);
  });

  // TODO bind error

  if (isLoading)
    return (
      <Box
        display="flex"
        height="80vh"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  return (
    <Box>
      <Stack spacing={2} margin="auto" width="50%" paddingY={10}>
        <Box marginBottom={2}>
          <Typography variant="h2" color="primary" sx={{ mb: 1 }}>
            {lange("Profile_Title")}
          </Typography>
          <Typography variant="h5" color="neutral.dark">
            {lange("Profile_Description")}
          </Typography>
        </Box>
        <Box
          component="form"
          display="flex"
          flexDirection="column"
          onSubmit={onSubmit}
          gap={2}
        >
          <ZKTextField
            disabled
            name="email"
            label={lange("Email")}
            control={control}
            required
          />
          <ZKTextField
            name="firstname"
            label={lange("First_Name")}
            control={control}
            required
          />
          <ZKTextField
            name="lastname"
            label={lange("Last_Name")}
            control={control}
            required
          />
          <ZKTextField
            name="organization"
            label={lange("Organization")}
            control={control}
            required
          />
          <ZKTextField
            name="title"
            label={lange("Title")}
            control={control}
            required
          />
          <PhoneInputWithCountry
            name="phone"
            control={control}
            placeholder={lange("Phone")}
            defaultCountry="HK"
          />

          <Stack spacing={1}>
            <Button disabled={isSame} variant="contained" type="submit">
              {mutation.isLoading ? (
                <CircularProgress size={20} color="secondary" />
              ) : (
                <Typography variant="button">{lange("Update")}</Typography>
              )}
            </Button>
            {!isSame && (
              <Button
                disabled={isSame}
                variant="contained"
                /* @ts-ignore */
                color="neutral"
                onClick={() => {
                  reset();
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default UserProfilePage;

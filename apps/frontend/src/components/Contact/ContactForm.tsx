import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailjs from "emailjs-com";
import { contactSchema } from '@legacy-apartment/shared';
import { Button, Input, TextArea } from "@legacy-apartment/ui";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const templateParams = {
      from_name: `${formData.firstName} ${formData.lastName}`,
      from_email: formData.email,
      to_name: process.env.NEXT_PUBLIC_SOCIETY_EMAIL || "thelegacyapartment@gmail.com",
      message: formData.message,
      reply_to: formData.email,
    };

    emailjs
      .send(
        process.env.NEXT_PUBLIC_SERVICE_ID,
        process.env.NEXT_PUBLIC_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_USER_ID
      )
      .then(
        () => {
          toast.success("Message sent");
          setFormData({ firstName: "", lastName: "", email: "", message: "" });
        },
        (error) => {
          toast.error("Failed to send message, please try again.");
          console.error("Email send error: ", error);
        }
      );
  };

  return (
    <div className="justify-center my-3">
      <div className="container px-6 py-10 mx-auto">
        <div className="text-center">
          <label className="text-orange-500 font-semibold text-sm mb-2">
            Let&apos;s get in touch
          </label>
          <h2 className="text-3xl font-bold text-center mb-8">
            How can we help you ?
          </h2>
        </div>
        {/* Flex container for the form */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0 lg:space-x-8">
          {/* Left side component */}
          <div className="w-full lg:w-1/2">
            <form
              onSubmit={handleSubmit}
              className="w-full border border-gray-400 shadow-md rounded px-8 pt-6 pb-8 mb-4 mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    id="firstName"
                    label="First Name"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <Input
                    id="lastName"
                    label="Last Name"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="mb-6">
                <TextArea
                  id="message"
                  label="Message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here"
                  rows={6}
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <Button variant="primary" type="submit">
                  Send
                </Button>
              </div>
            </form>
            <ToastContainer />
          </div>

          {/*Right side component*/}
          <div className="w-full lg:w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;

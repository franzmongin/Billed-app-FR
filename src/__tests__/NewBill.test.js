import {
  screen,
  getByTestId,
  fireEvent,
  toHaveTextContent,
} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import firestore from "../app/Firestore.js";
import { text } from "express";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When i click the submit button", () => {
      test("submit handler should be called", () => {
        const onNavigate = jest.fn();
        const html = NewBillUI({ data: [] });
        document.body.innerHTML = html;
        const newBill = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage,
        });
        const handleSubmit = jest.fn();
        const formNewBill = screen.getByTestId("form-new-bill");
        formNewBill.addEventListener("submit", handleSubmit);
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "franz@gmail.com",
            password: "mdp",
            status: "connected",
          })
        );
        formNewBill.submit();
        expect(handleSubmit).toBeCalled();
      });
    });
    describe("when i change the image in the file input", () => {
      test("error should appear if not good format and input get empty", () => {
        const onNavigate = jest.fn();
        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBill = new NewBill({
          document,
          onNavigate,
          firestore: firestore,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["chucknorris.txt"], "chucknorris.txt", {
                type: "text/txt",
              }),
            ],
          },
        });
        let inputValue = screen.getByTestId("file").value;
        expect(handleChangeFile).toBeCalled();
        expect(document.querySelector(".error-imageFormat").style.display).toBe(
          "block"
        );
        expect(inputValue).toBe('');
      });
      test("image should stay if format is good", () => {
        const onNavigate = jest.fn();
        const html = NewBillUI();
        document.body.innerHTML = html;
        const firestore = null;
        const newBill = new NewBill({
          document,
          onNavigate,
          firestore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["chucknorris.png"], "chucknorris.png", {
                type: "image/png",
              }),
            ],
          },
        });
        expect(handleChangeFile).toBeCalled();
        expect(document.querySelector(".error-imageFormat").style.display).toBe(
          "none"
        );
      });
    });
  });
});

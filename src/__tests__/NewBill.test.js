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
import firebase from "../__mocks__/firebase";
import BillsUI from "../views/BillsUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When i click the submit button", () => {
      test("then submit handler should be called", () => {
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
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
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
      test("then error should appear if not good format and input get empty", () => {
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
        expect(inputValue).toBe("");
      });
      test("then image should stay if format is good", () => {
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

// test d'intégration
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    describe("when i post a bill", () => {
      test("then if the bill is valid bill", async () => {
        const postSpy = jest.spyOn(firebase, "post");
        const validBill = {
          email: "anonym@gmail.com",
          type: "Transports",
          name: "paris marseille",
          amount: 50,
          date: "2021-09-16",
          vat: "70",
          pct: 20,
          commentary: "coucou",
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/billable-677b6.appspot.com/o/justificatifs%2Ftgv.jpg?alt=media&token=70a1caa5-d0be-44a2-8505-6bc2184d9cbf",
          fileName: "tgv.jpg",
          status: "pending",
        };
        const result = await firebase.post(validBill);
        console.log(result);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(result.data.length).toBe(1);
      });
      test("then if the bilfetches messages from an API and fails with 500 message error", async () => {
        firebase.post.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
        );
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
      test("fetches messages from an API and fails with 404 message error", async () => {
        firebase.post.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        );
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
    });
  });
});

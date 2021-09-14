import { screen, getByTestId, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import firestore from "../app/Firestore.js";

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
          firestore,
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
  });
});

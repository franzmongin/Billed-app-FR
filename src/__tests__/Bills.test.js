import { getByTestId, screen } from "@testing-library/dom";
import { getAllByTestId } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { text } from "express";
import LoadingPage from "../views/LoadingPage.js";
import ErrorPage from "../views/ErrorPage.js";
import NewBillUI from "../views/NewBillUI.js";
import Bills from "../containers/Bills.js";
import Logout from "../containers/Logout.js";
import firebase from "../__mocks__/firebase";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      const sortedBills = bills.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const html = BillsUI({ data: sortedBills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test("When loading i should see the loading page", () => {
      const html = BillsUI({ data: bills, loading: true });
      expect(html).toEqual(LoadingPage());
    });
    test("When error i should see the error page", () => {
      const error = "erreur de test";
      const html = BillsUI({ data: bills, error: error });
      expect(html).toEqual(ErrorPage(error));
    });
    describe("When i click on the new Bill button", () => {
      test("then new Bill handler should be called", () => {
        const onNavigate = jest.fn();
        const mockBills = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });
        mockBills.handleClickNewBill = jest.fn();
        screen
          .getByTestId("btn-new-bill")
          .addEventListener("click", mockBills.handleClickNewBill);
        screen.getByTestId("btn-new-bill").click();

        const buttonNewBill = screen.getByTestId("btn-new-bill");
        if (buttonNewBill) {
          buttonNewBill.addEventListener("click", mockBills.handleClickNewBill);
        }

        expect(mockBills.handleClickNewBill).toBeCalled();
      });
    });
    describe("When i click on the eye icon", () => {
      test("then the icon eye click handler should be called", () => {
        const onNavigate = jest.fn();
        const mockBills = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        mockBills.handleClickIconEye = jest.fn();
        const iconEye = screen.getAllByTestId("icon-eye");
        if (iconEye) {
          iconEye.forEach((icon) => {
            icon.addEventListener("click", (e) =>
              mockBills.handleClickIconEye(icon)
            );
          });
        }
        new Logout({ document, localStorage, onNavigate });
        screen.getAllByTestId("icon-eye").forEach((e) => {
          e.click();
          expect(mockBills.handleClickIconEye).toBeCalled();
        });
      });
      test("then modal should show", () => {
        const onNavigate = jest.fn();

        document.body.innerHTML = BillsUI({ data: bills });
        const mockBills = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });
        const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
        $.fn.modal = jest.fn((arg) => {
          document.querySelector("#modaleFile").classList.toggle(arg);
        });
        mockBills.handleClickIconEye(iconEye);
        expect(document.querySelector(".modal.show")).toBeTruthy();
      });
    });
  });
});

// Test d'intégration GET BILLS
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});

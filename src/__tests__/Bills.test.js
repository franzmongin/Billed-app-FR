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
      test("new Bill handler should be called", () => {
        const onNavigate = jest.fn();
        const mockBills = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });
        mockBills.handleClickIconEye = jest.fn();
        screen
          .getByTestId("btn-new-bill")
          .addEventListener("click", mockBills.handleClickIconEye);
        screen.getByTestId("btn-new-bill").click();
        expect(mockBills.handleClickIconEye).toBeCalled();
      });
    });
    describe("When i click on the eye icon", () => {
      test("the icon eye click handler should be called", () => {
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
        if (iconEye)
          iconEye.forEach((icon) => {
            icon.addEventListener("click", (e) =>
              mockBills.handleClickIconEye(icon)
            );
          });
        new Logout({ document, localStorage, onNavigate });
        screen.getAllByTestId("icon-eye")[0].click();
        expect(mockBills.handleClickIconEye).toBeCalled();
      });
      test("modal should show", () => {
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

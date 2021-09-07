import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { text } from "express";
import LoadingPage from "../views/LoadingPage.js";
import ErrorPage from "../views/ErrorPage.js";

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
  });
});

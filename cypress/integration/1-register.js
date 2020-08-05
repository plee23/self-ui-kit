import "cypress-iframe";
import utils from "../support/utils";

describe("Registration form", () => {
  it("should be reached from the login page", () => {
    cy.fixture("auth").then((fixture) => {
      utils.screenSizes.forEach((screenSize) => {
        utils.setViewPortToScreenSize(screenSize);

        cy.clearCookies();
        cy.visit("/");

        cy.get("#username");
        cy.get("#password");
        cy.get("#kc-login");
        cy.get("a").click();

        cy.location("pathname", {
          timeout: 10000
        }).should("include", fixture.registration_url);

        cy.get("#firstName");
        cy.get("#lastName");
        cy.get("#email");
        cy.get("#password");
        cy.get("#password-confirm");
        cy.get(".btn");
      });
    });
  });

  it("should register a new use and reach the main landing page", () => {
    cy.fixture("auth").then((fixture) => {
      const keycloakHost = process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL || fixture.keycloak_host;
      const keycloakRealm = process.env.KEYCLOAK_REALM || fixture.keycloak_realm;
      const keycloakClient = process.env.KEYCLOAK_BACKEND_CLIENT || fixture.keycloak_client;
      const keycloakClientSecret = process.env.KEYCLOAK_BACKEND_CREDENTIALS_SECRET || fixture.keycloak_client_secret;

      // we perform registration only once
      utils.screenSizes.forEach((screenSize) => {
        utils.setViewPortToScreenSize(screenSize);

        // delete use
        cy.exec(`./cypress/scripts/delete_test_user.sh -H '${keycloakHost}' -R '${keycloakRealm}' -C '${keycloakClient}' -S '${keycloakClientSecret}' -u '${fixture.email}' -p '${fixture.password}'`, {
          failOnNonZeroExit: false
        });

        cy.clearCookies();
        cy.visit("/");

        cy.get("a").click();

        cy.location("pathname", {
          timeout: 10000
        }).should("include", fixture.registration_url);

        cy.get("#firstName").type(fixture.first_name);
        cy.get("#lastName").type(fixture.last_name);
        cy.get("#email").type(fixture.email);
        cy.get("#password").type(fixture.password);
        cy.get("#password-confirm").type(fixture.password);
        cy.get("#kc-register-form").submit();

        cy.location("pathname", {
          timeout: 10000
        }).should("be", "/");

        cy.get("span").contains(fixture.landing_page_header_text);
      });
    });
  });
});
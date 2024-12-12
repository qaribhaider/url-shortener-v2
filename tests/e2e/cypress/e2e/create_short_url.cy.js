describe('URL Shortener E2E Tests', () => {
    it('Should shorten a URL successfully', () => {
        cy.visit('/');
        cy.get('input[type="text"]').type('https://example.com');
        cy.get('button[type="submit"]').click();
        cy.contains('Your shortened URL:').should('be.visible');
    });

    it('Should show error for invalid URL', () => {
        cy.visit('/');
        cy.get('input[type="text"]').type('invalid-url');
        cy.get('button[type="submit"]').click();
        cy.contains('must be a URL address').should('be.visible');
    });
});
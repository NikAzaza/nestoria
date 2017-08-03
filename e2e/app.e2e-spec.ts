import { NestoriaPage } from './app.po';

describe('nestoria App', () => {
  let page: NestoriaPage;

  beforeEach(() => {
    page = new NestoriaPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});

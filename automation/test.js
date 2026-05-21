const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function runCampusSkillSwapDemo() {
  let options = new chrome.Options();
  options.addArguments("--remote-allow-origins=*");
  options.addArguments("--disable-gpu");
  options.addArguments("--start-maximized");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  const uniqueNum = Math.floor(Math.random() * 9000) + 1000;
  const testUser = {
    name: `User_${uniqueNum}`,
    studentId: `ST${uniqueNum}`,
    email: `student${uniqueNum}@gmail.com`,
    password: "Password123!",
  };

  try {
    console.log("Starting Demonstration");

    //REGISTRATION
    await driver.get("http://localhost:3000/login");
    await driver
      .wait(
        until.elementLocated(By.xpath("//a[contains(text(), 'Sign up here')]")),
        5000,
      )
      .click();

    await driver.wait(until.elementLocated(By.id("name")), 5000);
    await driver.findElement(By.id("name")).sendKeys(testUser.name);
    await driver.findElement(By.id("studentId")).sendKeys(testUser.studentId);
    await driver.findElement(By.id("email")).sendKeys(testUser.email);
    await driver.findElement(By.id("password")).sendKeys(testUser.password);

    let teachingInput = await driver.findElement(
      By.xpath("//input[contains(@placeholder, 'Add skills you can teach')]"),
    );
    for (let skill of ["SQL", "React", "Basketball"]) {
      await teachingInput.sendKeys(skill, Key.ENTER);
      await driver.sleep(500);
    }

    let learningInput = await driver.findElement(
      By.xpath(
        "//input[contains(@placeholder, 'Add skills you want to learn')]",
      ),
    );
    for (let skill of ["Javascript", "Football", "Hockey"]) {
      await learningInput.sendKeys(skill, Key.ENTER);
      await driver.sleep(500);
    }

    await driver.findElement(By.id("bio")).sendKeys("Hello", Key.ENTER);
    await driver
      .findElement(By.xpath("//button[text()='Create Account']"))
      .click();
    console.log("Step 1 Registration submitted.");

    //LOGOUT
    async function performLogout() {
      console.log("Logout");
      let logoutBtn = await driver.wait(
        until.elementLocated(By.xpath("//*[text()='Logout']")),
        10000,
      );
      await driver.executeScript("arguments[0].click();", logoutBtn);

      let confirmBtn = await driver.wait(
        until.elementLocated(
          By.xpath("//button[contains(@class, 'MuiButton-containedError')]"),
        ),
        5000,
      );
      await confirmBtn.click();
      console.log("Session cleared.");
    }

    await driver.wait(
      until.elementLocated(By.xpath("//h4[contains(text(), 'Welcome back')]")),
      10000,
    );
    await performLogout();

    //LOGIN
    await driver
      .wait(until.elementLocated(By.id("email")), 5000)
      .sendKeys(testUser.email);
    await driver.findElement(By.id("password")).sendKeys(testUser.password);
    await driver.findElement(By.css("button[type='submit']")).click();
    console.log("Step 2 Login successful.");

    //SEARCH & REQUEST
    console.log("search for Sakshi Singh...");
    let searchBar = await driver.wait(
      until.elementLocated(
        By.xpath("//input[@placeholder='Search for users or skills...']"),
      ),
      10000,
    );
    await searchBar.clear(); // Clear any existing text
    await searchBar.sendKeys("Sakshi Singh", Key.ENTER);
    console.log("Step 3 Searched for 'Sakshi Singh'.");

    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'All Users')]")),
      10000,
    );
    await driver.sleep(4000);

    let sendRequestBtn;
    try {
      sendRequestBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Send Request')]")),
        8000,
      );

      await driver.executeScript("arguments[0].click();", sendRequestBtn);
      console.log("Step 4 Friend Request sent successfully.");
    } catch (staleError) {
      console.log("Caught stale element, retrying click...");
      sendRequestBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Send Request')]")),
        10000,
      );
      await driver.executeScript("arguments[0].click();", sendRequestBtn);
    }
    //FINAL LOGOUT
    await driver.sleep(2000);
    await performLogout();

    console.log("Demonstration Completed Successfully!");
  } catch (error) {
    console.error("❌ Automation Error:", error.message);
  } finally {
    await driver.sleep(5000);
    await driver.quit();
  }
}

runCampusSkillSwapDemo();

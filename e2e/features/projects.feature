Feature: Projects and activities
  Which projects a role is served, who may start one, whose work the dashboard
  is reporting, where a project opens, and who can be made responsible for the
  work inside it.

  Scenario Outline: The project list is scoped to what the role may reach
    Given I am signed in as "<role>"
    When I open the project list
    Then I see exactly the projects in my scope

    Examples:
      | role    |
      | Owner   |
      | Admin   |
      | Manager |
      | User    |

  Scenario Outline: Starting a new project is offered only to whoever may start one
    Given I am signed in as "<role>"
    When I open the project list
    Then starting a new project is "<availability>"

    Examples:
      | role    | availability |
      | Owner   | offered      |
      | Admin   | offered      |
      | Manager | offered      |
      | User    | not offered  |

  Scenario Outline: The dashboard says whose work it is reporting
    Given I am signed in as "<role>"
    When I open the portfolio dashboard
    Then the dashboard reports on "<scope>"

    Examples:
      | role    | scope                  |
      | Owner   | the whole organization |
      | Manager | only my own projects   |

  Scenario: A live project opens on its schedule
    Given I am signed in as "Manager"
    When I open the project "Torre Residencial Norte"
    Then I see its schedule, with its main activities on it

  Scenario: A draft opens on its resumable review, never on project detail
    Given I am signed in as "Manager"
    When I open a draft from the drafts home
    Then I land on that draft's review canvas

  Scenario: The listing lives in the address, so a reload keeps it
    Given I am signed in as "Owner"
    When I search the project list for "Torre"
    And I reload the page
    Then only the projects matching "Torre" are listed

  Scenario: Naming somebody responsible offers the team and the organization's leadership
    Given I am signed in as "Manager"
    When I look at who can be made responsible for an activity
    Then a member of that project is offered
    And somebody who runs the organization is offered, with their role shown

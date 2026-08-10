Feature: Access by role
  Signing in puts every role on a screen it can actually use, the navigation
  offers it only the destinations it owns, and a destination it cannot reach
  explains itself instead of leaving it stranded.

  Scenario Outline: Signing in lands each role on a home it can use
    Given my account is the "<role>"
    When I sign in
    Then I land on "<home>"

    Examples:
      | role    | home                    |
      | Owner   | the portfolio dashboard |
      | Admin   | the portfolio dashboard |
      | Manager | the portfolio dashboard |
      | User    | the project list        |

  Scenario Outline: The navigation offers each role only the destinations it owns
    Given I am signed in as "<role>"
    When I open the app
    Then my navigation offers "<offered>"
    And my navigation hides "<hidden>"

    Examples:
      | role    | offered                                                                                   | hidden                                                              |
      | Owner   | the dashboard, the project list, the approvals inbox, the organization roster, the trash  | nothing                                                             |
      | Admin   | the dashboard, the project list, the approvals inbox, the organization roster, the trash  | nothing                                                             |
      | Manager | the dashboard, the project list, the approvals inbox, the drafts home                     | the organization roster, the trash                                  |
      | User    | the project list, the approvals inbox, my account settings                                | the dashboard, the organization roster, the trash, the drafts home  |

  Scenario Outline: A destination a role cannot reach explains itself
    Given I am signed in as "<role>"
    When I open "<destination>" directly
    Then I am told my role does not include it
    And I am offered a way back to the project list

    Examples:
      | role    | destination             |
      | Manager | the organization roster |
      | User    | the dashboard           |

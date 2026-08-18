Feature: Approvals
  What separates the User from everybody else: where the others act, they ask.
  The budget of an activity, the start of a blocked one, and the inbox where
  those requests are decided.

  Scenario Outline: Changing an activity's budget is either done or asked for
    Given I am signed in as "<role>"
    When I look at what I can do with an activity's budget
    Then the budget control offered to me is "<control>"

    Examples:
      | role    | control             |
      | Owner   | a direct edit       |
      | Admin   | a direct edit       |
      | Manager | a direct edit       |
      | User    | an approval request |

  Scenario Outline: Starting a blocked activity is either done or asked for
    Given I am signed in as "<role>"
    When I open a blocked activity
    Then the force-start control offered to me is "<control>"

    Examples:
      | role    | control               |
      | Owner   | an outright override  |
      | Admin   | an outright override  |
      | Manager | an outright override  |
      | User    | an approval request   |

  Scenario Outline: The approvals inbox either decides or only informs
    Given I am signed in as "<role>"
    When I open the approvals inbox
    Then the inbox lets me "<capability>"

    Examples:
      | role    | capability                |
      | Owner   | decide the requests       |
      | Admin   | decide the requests       |
      | Manager | decide the requests       |
      | User    | only watch my own requests |

  Scenario: Forcing a start reaches the backend and reports what it cost
    Given I am signed in as "Manager"
    When I force the start of a blocked activity
    Then I am told the activity started and is marked at risk
    And the screen has no critical accessibility violations

Feature: Organization
  Who may grant which role on the roster, and who may leave the organization on
  their own.

  Scenario Outline: Admin is granted by the Owner alone
    Given I am signed in as "<role>"
    When I go to grant a role to "Roberto Castillo"
    Then granting Admin is "<availability>"

    Examples:
      | role  | availability |
      | Owner | offered      |
      | Admin | not offered  |

  Scenario: The owner's role cannot be changed from the roster
    Given I am signed in as "Owner"
    When I open the organization roster
    Then the owner's row offers no way to change their role

  @pending-ui
  Scenario Outline: Deleting your own account is offered only to the whole-organization roles
    Given I am signed in as "<role>"
    When I open my account settings
    Then deleting my own account is "<availability>"

    Examples:
      | role    | availability |
      | Owner   | offered      |
      | Admin   | offered      |
      | Manager | not offered  |
      | User    | not offered  |

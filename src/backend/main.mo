import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  type Time = Int;

  public type OrderStatus = {
    #pending;
    #shipped;
  };

  public type PaymentContactStatus = {
    #notContacted;
    #contacted;
    #paymentReceived;
  };

  public type IDInformation = {
    height : Text;
    hairColor : Text;
    eyeColor : Text;
    weight : Text;
    dateOfBirth : Text;
    sex : Text;
    photo : ?Storage.ExternalBlob;
    signature : ?Storage.ExternalBlob;
  };

  public type ShippingAddress = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    email : Text;
    phone : Text;
    status : OrderStatus;
    createdTime : Int;
    owner : Principal;
    shippingAddress : ShippingAddress;
    idInfo : IDInformation;
    paymentContactStatus : PaymentContactStatus;
    contactNotes : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Initialize storage
  include MixinStorage();

  // User profiles storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Orders storage
  let orders = Map.empty<Nat, Order>();
  var nextOrderId : Nat = 0;

  // Track if bootstrap admin has been assigned
  var bootstrapAdminAssigned = false;

  // The specific principal allowed to bootstrap as admin
  let BOOTSTRAP_ADMIN_PRINCIPAL = Principal.fromText("jpmy2-7y5t4-jv5ee-rzfvm-562pu-czjjc-zj4oz-ohmp2-6h3al-3az2q-7qe");

  // Admin invitations by principal
  let adminInvitations = Set.empty<Principal>();

  // Email to principal mapping for invitation lookup
  let emailToPrincipal = Map.empty<Text, Principal>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    // Update email mapping for admin invitation lookup
    emailToPrincipal.add(profile.email, caller);
  };

  // Order Management Functions
  public shared ({ caller }) func createOrder(
    customerName : Text,
    email : Text,
    phone : Text,
    shippingAddress : ShippingAddress,
    idInfo : IDInformation,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id = orderId;
      customerName = customerName;
      email = email;
      phone = phone;
      status = #pending;
      createdTime = Time.now();
      owner = caller;
      shippingAddress = shippingAddress;
      idInfo = idInfo;
      paymentContactStatus = #notContacted;
      contactNotes = "";
    };

    orders.add(orderId, order);
    orderId;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        // Users can only view their own orders, admins can view all
        if (not (order.owner == caller or AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let userOrders = orders.filter(func(_id, order) { order.owner == caller });
    userOrders.values().toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          order with status = status;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updatePaymentContactStatus(
    orderId : Nat,
    paymentContactStatus : PaymentContactStatus,
    contactNotes : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update payment contact status");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          order with
          paymentContactStatus = paymentContactStatus;
          contactNotes = contactNotes;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updateOrder(
    orderId : Nat,
    customerName : Text,
    email : Text,
    phone : Text,
    shippingAddress : ShippingAddress,
    idInfo : IDInformation,
    status : OrderStatus,
    paymentContactStatus : PaymentContactStatus,
    contactNotes : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can edit orders");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          order with
          customerName = customerName;
          email = email;
          phone = phone;
          shippingAddress = shippingAddress;
          idInfo = idInfo;
          status = status;
          paymentContactStatus = paymentContactStatus;
          contactNotes = contactNotes;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func deleteOrder(orderId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?_order) {
        orders.remove(orderId);
      };
    };
  };

  // Admin Invitation Functions
  public query ({ caller }) func checkAdminInvitation() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check invitations");
    };
    adminInvitations.contains(caller);
  };

  public shared ({ caller }) func acceptAdminInvitation() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can accept invitations");
    };

    if (not adminInvitations.contains(caller)) {
      Runtime.trap("No admin invitation found");
    };

    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    adminInvitations.remove(caller);
  };

  public shared ({ caller }) func declineAdminInvitation() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can decline invitations");
    };

    if (not adminInvitations.contains(caller)) {
      Runtime.trap("No admin invitation found");
    };
    adminInvitations.remove(caller);
  };

  public shared ({ caller }) func sendAdminInvitationByEmail(email : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can send invitations");
    };

    switch (emailToPrincipal.get(email)) {
      case (null) {
        Runtime.trap("User with email not found. User must have a profile first.");
      };
      case (?userPrincipal) {
        adminInvitations.add(userPrincipal);
      };
    };
  };

  public shared ({ caller }) func sendAdminInvitation(user : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can send invitations");
    };
    adminInvitations.add(user);
  };

  // Bootstrap function - SECURITY CRITICAL
  // Only allows the specific bootstrap principal to become admin, and only once
  public shared ({ caller }) func assignAdminRoleToCaller() : async () {
    // SECURITY: Only the designated bootstrap principal can call this
    if (caller != BOOTSTRAP_ADMIN_PRINCIPAL) {
      Runtime.trap("Unauthorized: Only the designated bootstrap principal can use this function");
    };

    // SECURITY: Can only be used once to prevent abuse
    if (bootstrapAdminAssigned) {
      Runtime.trap("Bootstrap admin has already been assigned");
    };

    // SECURITY: Verify caller is not already an admin
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Caller is already an admin");
    };

    // Assign admin role to the bootstrap principal
    AccessControl.assignRole(accessControlState, caller, caller, #admin);

    // Mark bootstrap as complete
    bootstrapAdminAssigned := true;
  };

  // Admin check function for frontend - requires authentication
  public query ({ caller }) func isAdmin() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check admin status");
    };
    AccessControl.isAdmin(accessControlState, caller);
  };
};

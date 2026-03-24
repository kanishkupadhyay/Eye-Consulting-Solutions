class UserFactory {
  public static transformUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      countryCode: user.countryCode,
      phone: user.phone,
      lastLogin: user.lastLogin,
      isAdmin: user?.isAdmin,
    };
  }
}

export default UserFactory;
